import { useEffect, useRef, useState } from 'react'
import { tokens, fontMono } from '../../../design/tokens'
import { Pill, TermButton, Kbd } from '../../../design/primitives'
import { GridBoard } from '../level/views/GridBoard'
import { units } from '../units/registry'
import { recommendUnitIndex, type UsedVim, type Operators, type PlacementAnswers } from './placement'

interface OnboardingProps {
  /** Start the player at the recommended unit (already unlocked by the caller). */
  onFinish: (unitId: string) => void
  /** Skip placement and go to the world map. */
  onSkip: () => void
}

type Step = 'demo' | 'q1' | 'q2' | 'q3' | 'result'
const STEPS: Step[] = ['demo', 'q1', 'q2', 'q3', 'result']

const DEMO_TARGETS = [
  { x: 5, y: 3 },
  { x: 0, y: 3 },
  { x: 5, y: 0 },
  { x: 2, y: 1 },
]

export default function Onboarding({ onFinish, onSkip }: OnboardingProps) {
  const [step, setStep] = useState<Step>('demo')
  const [used, setUsed] = useState<UsedVim | undefined>()
  const [movement, setMovement] = useState<boolean | undefined>()
  const [operators, setOperators] = useState<Operators | undefined>()

  const stepIdx = STEPS.indexOf(step)

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        padding: 48,
        background: `radial-gradient(ellipse 60% 60% at 50% 25%, rgba(16,255,160,.07), transparent 70%), ${tokens.bg}`,
      }}
    >
      {/* step dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              width: i === stepIdx ? 22 : 8,
              height: 8,
              background: i <= stepIdx ? tokens.bright : tokens.line,
              boxShadow: i === stepIdx ? `0 0 8px ${tokens.bright}` : 'none',
              transition: 'all .2s',
            }}
          />
        ))}
      </div>

      {step === 'demo' && <DemoStep onContinue={() => setStep('q1')} onSkip={onSkip} />}

      {step === 'q1' && (
        <Question
          tag="01 / 03"
          prompt="Have you used Vim before?"
          options={[
            { label: 'Never', value: 'never' as UsedVim, sub: "Total beginner — that's the best place to start." },
            { label: 'A little', value: 'some' as UsedVim, sub: 'Dabbled, but it never stuck.' },
            { label: 'I use it daily', value: 'daily' as UsedVim, sub: 'Here to fill the gaps.' },
          ]}
          onPick={(v) => {
            setUsed(v)
            setStep('q2')
          }}
        />
      )}

      {step === 'q2' && (
        <Question
          tag="02 / 03"
          prompt="Comfortable moving with h j k l?"
          options={[
            { label: 'Not really', value: false, sub: 'We start with movement fundamentals.' },
            { label: 'Yes, fluent', value: true, sub: 'Great — we can move past the basics.' },
          ]}
          onPick={(v) => {
            setMovement(v)
            setStep('q3')
          }}
        />
      )}

      {step === 'q3' && (
        <Question
          tag="03 / 03"
          prompt="Know operators like dd, cw, yy?"
          options={[
            { label: 'No idea', value: 'no' as Operators, sub: 'The good stuff is ahead.' },
            { label: 'Some of them', value: 'some' as Operators, sub: "We'll sharpen editing." },
            { label: 'Yes, fluent', value: 'yes' as Operators, sub: 'Jump to the refactoring units.' },
          ]}
          onPick={(v) => {
            setOperators(v)
            setStep('result')
          }}
        />
      )}

      {step === 'result' && (
        <ResultStep
          answers={{ used: used ?? 'never', movement: movement ?? false, operators: operators ?? 'no' }}
          onStart={onFinish}
          onStartBeginning={() => onFinish(units[0].id)}
        />
      )}
    </div>
  )
}

function DemoStep({ onContinue, onSkip }: { onContinue: () => void; onSkip: () => void }) {
  const [cur, setCur] = useState({ x: 0, y: 0 })
  const targetIdx = useRef(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setCur((c) => {
        const t = DEMO_TARGETS[targetIdx.current]
        if (c.x === t.x && c.y === t.y) {
          targetIdx.current = (targetIdx.current + 1) % DEMO_TARGETS.length
          return { x: 0, y: 0 }
        }
        let { x, y } = c
        if (x < t.x) x++
        else if (x > t.x) x--
        else if (y < t.y) y++
        else if (y > t.y) y--
        return { x, y }
      })
    }, 430)
    return () => window.clearInterval(id)
  }, [])

  const target = DEMO_TARGETS[targetIdx.current]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 560, textAlign: 'center' }}>
      <Pill tone="amber">◣ WELCOME TO VIMSANITY 2.0</Pill>
      <h1 className="vs-glow" style={{ fontFamily: fontMono, fontSize: 'clamp(34px,6vw,64px)', fontWeight: 800, color: tokens.bright, margin: 0, lineHeight: 1 }}>
        LEARN VIM BY PLAYING
      </h1>
      <div className="vs-frame-hot" style={{ padding: 18, background: tokens.bgPanel }}>
        <GridBoard width={6} height={4} cursor={cur} target={target} cellSize={40} />
      </div>
      <p style={{ fontSize: 15, color: tokens.text, lineHeight: 1.6 }}>
        The map <em>is</em> the game. You move a cursor with <Kbd hot>h</Kbd> <Kbd hot>j</Kbd> <Kbd hot>k</Kbd> <Kbd hot>l</Kbd> — never the mouse — chasing targets and clearing puzzles under par.
      </p>
      <div style={{ display: 'flex', gap: 14 }}>
        <TermButton hot big onClick={onContinue}>Continue ▸</TermButton>
        <TermButton big onClick={onSkip}>Skip intro</TermButton>
      </div>
    </div>
  )
}

function Question<T>({
  tag,
  prompt,
  options,
  onPick,
}: {
  tag: string
  prompt: string
  options: Array<{ label: string; value: T; sub: string }>
  onPick: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, width: 'min(560px, 92%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: tokens.amber, letterSpacing: '.3em', marginBottom: 8 }}>{tag}</div>
        <h2 className="vs-glow" style={{ fontFamily: fontMono, fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: tokens.bright, margin: 0 }}>
          {prompt}
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {options.map((o, i) => (
          <button
            key={i}
            onClick={() => onPick(o.value)}
            className="vs-frame"
            style={{
              textAlign: 'left',
              padding: '16px 20px',
              background: tokens.bgPanel,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span style={{ fontFamily: fontMono, fontSize: 13, color: tokens.dim, fontWeight: 800 }}>{String.fromCharCode(65 + i)}</span>
            <span style={{ flex: 1 }}>
              <span className="vs-glow" style={{ display: 'block', fontSize: 16, fontWeight: 700, color: tokens.bright }}>{o.label}</span>
              <span style={{ fontSize: 12.5, color: tokens.text }}>{o.sub}</span>
            </span>
            <span style={{ color: tokens.dim }}>▸</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ResultStep({
  answers,
  onStart,
  onStartBeginning,
}: {
  answers: PlacementAnswers
  onStart: (unitId: string) => void
  onStartBeginning: () => void
}) {
  const idx = recommendUnitIndex(answers, units.length)
  const unit = units[idx]
  const isBeginner = idx === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, maxWidth: 560, textAlign: 'center' }}>
      <Pill tone="green">◢ PLACEMENT COMPLETE</Pill>
      <div style={{ fontSize: 13, color: tokens.dim, letterSpacing: '.2em' }}>WE'LL START YOU AT</div>
      <h1 className="vs-glow-strong" style={{ fontFamily: fontMono, fontSize: 'clamp(34px,6vw,64px)', fontWeight: 800, color: tokens.bright, margin: 0, lineHeight: 1 }}>
        {unit.title}
      </h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {unit.motionLabel.split(' ').map((k, i) => (
          <Kbd key={i} hot>{k}</Kbd>
        ))}
      </div>
      <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.6 }}>
        {isBeginner
          ? "Everyone starts here — you'll be moving without arrow keys in minutes."
          : "Earlier units stay unlocked on the map if you ever want to backfill."}
      </p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <TermButton hot big onClick={() => onStart(unit.id)}>▶ Start {unit.title}</TermButton>
        {!isBeginner && <TermButton big onClick={onStartBeginning}>Start from the beginning</TermButton>}
      </div>
    </div>
  )
}
