;(async () => {
  const expensesArray = [
    { name: 'John', expense: 335.82 },
    { name: 'Daniel', expense: 172.48 },
    { name: 'Edward', expense: 180 },
    { name: 'Lincoln', expense: 10 },
  ].sort((a, b) => (a.name < b.name ? -1 : 1))

  const divideExpenses = expensesArray.map(expense => {
    return {
      [`${expense.name} (Paga)`]: {
        ...expensesArray.reduce((prev, cur) => {
          const calc =
            Number(cur.expense) / expensesArray.length -
            Number(expense.expense) / expensesArray.length

          return {
            ...prev,
            [`${cur.name} (Recebe)`]:
              expense.name === cur.name
                ? 'X'
                : Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(calc < 0 ? 0 : calc),
          }
        }, {}),
      },
    }
  })

  const divideFormatted = divideExpenses.reduce(
    (prev, acc) => ({ ...prev, [Object.keys(acc)[0]]: Object.values(acc)[0] }),
    {},
  )

  const expensesFormatted = expensesArray.reduce(
    (prev, acc) => ({
      ...prev,
      [acc.name]: {
        gastou: acc.expense,
        [`/${expensesArray.length}`]: Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'BRL',
        }).format(Number(acc.expense / expensesArray.length)),
      },
    }),
    {},
  )

  console.table(expensesFormatted)
  console.table(divideFormatted)
})()
