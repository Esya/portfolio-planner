import { all } from 'typed-redux-saga'
import { datasetSaga } from '../slices/dataset/dataset.saga'
import { mapSaga } from '../slices/map/map.saga'
import { resultsSaga } from '../slices/results/results.saga'

export default function* rootSaga() {
  console.log('Root saga started')
  yield all([datasetSaga(), mapSaga(), resultsSaga()])
}
