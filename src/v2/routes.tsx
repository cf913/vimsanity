import { Route } from 'react-router-dom'
import Shell from './shell/Shell'
import LearnWing from './wings/learn/LearnWing'
import UnitRunner from './wings/learn/UnitRunner'
import DexScreen from './wings/learn/screens/DexScreen'
import BossScreen from './wings/learn/screens/BossScreen'
import PracticeWing from './wings/practice/PracticeWing'
import ApplyWing from './wings/apply/ApplyWing'

export function v2Routes() {
  return (
    <Route element={<Shell />}>
      <Route path="/learn" element={<LearnWing />}>
        <Route path="dex" element={<DexScreen />} />
        <Route path="boss" element={<BossScreen />} />
        <Route path=":unitId" element={<UnitRunner />} />
      </Route>
      <Route path="/practice" element={<PracticeWing />} />
      <Route path="/apply" element={<ApplyWing />} />
    </Route>
  )
}
