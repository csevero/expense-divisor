'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'

const expenseSchema = z.object({
  expenses: z.array(
    z.object({
      name: z
        .string({ required_error: 'Nome é obrigatório' })
        .min(1, 'Nome é obrigatório'),
      amount: z
        .string()
        .transform((value, ctx) => {
          if (isNaN(Number(value)))
            return ctx.addIssue({
              code: 'custom',
              message: 'O valor precisa ser um número',
            })

          return Number(value)
        })
        .or(z.number()),
    }),
  ),
})

type ExpenseSchema = z.infer<typeof expenseSchema>

interface ITotalExpense {
  participants: string[]
  expenses: Record<string, number[]>
}

export default function Home() {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ExpenseSchema>({
    defaultValues: {
      expenses: [
        {
          name: '',
          amount: 0,
        },
      ],
    },
    resolver: zodResolver(expenseSchema),
  })

  const { fields, append, remove } = useFieldArray({
    name: 'expenses',
    control,
  })

  const [totalExpenses, setTotalExpenses] = useState<ITotalExpense | undefined>(
    undefined,
  )

  const handleWithSubmit: SubmitHandler<ExpenseSchema> = data => {
    const expensesArray = data.expenses.sort((a, b) =>
      a.name < b.name ? -1 : 1,
    )

    const divideExpenses = expensesArray.map(expense => {
      return {
        [expense.name]: {
          ...expensesArray.reduce((prev, cur) => {
            const calc =
              Number(cur.amount) / expensesArray.length -
              Number(expense.amount) / expensesArray.length

            return {
              ...prev,
              [cur.name]: expense.name === cur.name ? 'X' : calc < 0 ? 0 : calc,
            }
          }, {}),
        },
      }
    })

    const divideFormatted = divideExpenses.reduce(
      (prev, acc) => ({
        ...prev,
        [Object.keys(acc)[0]]: Object.values(acc)[0],
      }),
      {},
    )

    const participants = Object.keys(divideFormatted)

    const anchor: Record<string, number[]> = {}

    Object.values(divideFormatted).map((value: Record<string, any>) => {
      Object.entries(value).map(subValue => {
        return (anchor[subValue[0]] = [
          ...(anchor[subValue[0]] ? [...anchor[subValue[0]]] : []),
          subValue[1],
        ])
      })
    })

    setTotalExpenses({
      expenses: anchor,
      participants,
    })
  }

  const formatNumberToCurrency = (value: number) => {
    if (isNaN(value)) return value
    return Intl.NumberFormat(undefined, {
      currency: 'BRL',
      style: 'currency',
    }).format(value)
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit(handleWithSubmit)} className="flex flex-col">
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 relative">
              <div className="flex flex-col">
                <input
                  {...register(`expenses.${index}.name`)}
                  placeholder="Nome"
                  className="border-2 border-black rounded-lg p-2"
                />
                {errors.expenses?.[index]?.name?.message && (
                  <span className="text-red-500 text-sm">
                    {errors.expenses?.[index]?.name?.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  {...register(`expenses.${index}.amount`)}
                  placeholder="Total"
                  className="border-2 border-black rounded-lg p-2"
                />
                {errors.expenses?.[index]?.amount?.message && (
                  <span className="text-red-500 text-sm">
                    {errors.expenses?.[index]?.amount?.message}
                  </span>
                )}
              </div>
              {index > 0 && (
                <button
                  onClick={() => remove(index)}
                  className="absolute -right-20 top-[20%]"
                >
                  Excluir
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ name: '', amount: 0 })}
          className="mt-2"
        >
          Adicionar
        </button>
        <button type="submit" className="mt-4">
          Calcular
        </button>
      </form>
      {totalExpenses && (
        <table>
          <tbody>
            <tr className="font-bold">
              <td className="border-2 border-gray-500 p-2">
                Paga /
                <br />
                Recebe
              </td>
              {totalExpenses.participants.map((participant, index) => (
                <td
                  key={`${participant}-${index}`}
                  className="border-2 border-gray-500 p-2"
                >
                  {participant}
                </td>
              ))}
            </tr>
          </tbody>
          <tbody>
            {Object.entries(totalExpenses.expenses).map((expense, index) => (
              <tr key={`${expense[0]}-${index}`}>
                <td className="border-2 border-gray-500 p-2 font-bold">
                  {expense[0]}
                </td>
                {expense[1].map((amount, index) => (
                  <td
                    className="border-2 border-gray-500 p-2"
                    key={`${expense[0]}-${amount}-${index}`}
                  >
                    {formatNumberToCurrency(amount)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
