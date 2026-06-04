import { Link } from 'react-router-dom'
import { tokens } from '../../design/tokens'
import { ASCIIHeading, Pill, TermButton } from '../../design/primitives'

export default function ApplyWing() {
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
      <Pill tone="purple">⚒ APPLY · COMING SOON</Pill>
      <ASCIIHeading sub="~/APPLY" size={56}>
        CAPSTONES
      </ASCIIHeading>
      <p style={{ maxWidth: 520, color: tokens.text, lineHeight: 1.6, fontSize: 15 }}>
        Hand-crafted capstone missions — refactor real code against a goal — unlock here once you
        graduate chunks of <span style={{ color: tokens.purple }}>Learn</span>. Arriving with a future release.
      </p>
      <Link to="/learn" style={{ textDecoration: 'none' }}>
        <TermButton hot>◀ Back to Learn</TermButton>
      </Link>
    </div>
  )
}
