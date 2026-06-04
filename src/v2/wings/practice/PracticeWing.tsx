import { Link } from 'react-router-dom'
import { tokens } from '../../design/tokens'
import { ASCIIHeading, Pill, TermButton } from '../../design/primitives'

export default function PracticeWing() {
  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 48,
        textAlign: 'center',
        background: tokens.bg,
      }}
    >
      <Pill tone="amber">🎯 PRACTICE · COMING SOON</Pill>
      <ASCIIHeading sub="~/PRACTICE" size={56}>
        DAILY PUZZLE
      </ASCIIHeading>
      <p style={{ maxWidth: 520, color: tokens.text, lineHeight: 1.6, fontSize: 15 }}>
        One shared daily par-puzzle and a drill library land here next — the retention loop. For now,
        head to <span style={{ color: tokens.amber }}>Learn</span> and work the overworld.
      </p>
      <Link to="/learn" style={{ textDecoration: 'none' }}>
        <TermButton hot>◀ Back to Learn</TermButton>
      </Link>
    </div>
  )
}
