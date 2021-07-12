const apiURL = process.env.REACT_APP_API_URL

function client(
  endpoint,
  {token, headers: customerHeaders, ...customConfig} = {},
) {
  const config = {
    method: 'GET',
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      ...customerHeaders,
    },
    ...customConfig,
  }

  return window.fetch(`${apiURL}/${endpoint}`, config).then(async response => {
    const data = await response.json()
    if (response.ok) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}

export {client}
