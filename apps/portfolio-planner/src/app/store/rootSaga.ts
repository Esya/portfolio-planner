import { all } from 'typed-redux-saga'
import { datasetSaga } from '../slices/dataset/dataset.saga'

export default function* rootSaga() {
  console.log('Root saga started')
  yield all([datasetSaga()])
}
