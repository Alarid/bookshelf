import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from 'utils/api-client'

export function useListItems(user) {
  const {data: listItems, ...rest} = useQuery({
    queryKey: 'list-items',
    queryFn: () =>
      client(`list-items`, {token: user.token}).then(data => data.listItems),
  })

  return {listItems, ...rest}
}

export function useListItem(user, bookId) {
  const {listItems, ...rest} = useListItems(user)
  const listItem = listItems?.find(li => li.bookId === bookId) ?? null

  return {listItem, ...rest}
}

export function useUpdateListItem(user) {
  const [mutate, infos] = useMutation(
    updates =>
      client(`list-items/${updates.id}`, {
        method: 'PUT',
        data: updates,
        token: user.token,
      }),
    {onSettled: () => queryCache.invalidateQueries('list-items')},
  )

  return {mutate, ...infos}
}

export function useRemoveListItem(user) {
  const [remove, infos] = useMutation(
    ({id}) => client(`list-items/${id}`, {method: 'DELETE', token: user.token}),
    {onSettled: () => queryCache.invalidateQueries('list-items')},
  )

  return {remove, ...infos}
}

export function useCreateListItem(user) {
  const [create, ...infos] = useMutation(
    ({bookId}) => client(`list-items`, {data: {bookId}, token: user.token}),
    {onSettled: () => queryCache.invalidateQueries('list-items')},
  )
  return {create, ...infos}
}
