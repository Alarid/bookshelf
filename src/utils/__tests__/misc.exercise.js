import {formatDate} from '../misc'

test('formatDate formats the date to look nice', () => {
  expect(formatDate(new Date('2020-01-01'))).toBe('Jan 20')
})
