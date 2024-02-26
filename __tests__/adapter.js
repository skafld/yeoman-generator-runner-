const {StorageAdapter} = require('../src/adapter');

test('StorageAdapter#constructor args', async () => {
  const answers = {}
  const options = {}
  const adapter = new StorageAdapter(answers, options)

  expect(adapter.answers).toBe(answers)
})

test('StorageAdapter#prompt', async () => {
  const adapter = new StorageAdapter({q1: true, q2: 123})
  const result = await adapter.prompt([
    {
      name: 'q1',
      type: 'confirm',
      default: false,
      message: 'Q 1 ?'
    },
    {
      name: 'q2',
      type: 'input',
      message: 'Q 2 ?'
    },
    {
      name: 'q3',
      type: 'input',
      default: 'abc',
      message: 'Q 3 ?'
    }
  ])

  expect(result).toEqual({
    q1: true,
    q2: 123,
    q3: 'abc'
  })
})

test('StorageAdapter#prompt Unknow', async () => {
  const adapter = new StorageAdapter({q1: true})

  expect.assertions(1)

  try {
    await adapter.prompt([
      {
        name: 'q1',
        type: 'confirm',
        default: false,
        message: 'Q 1 ?'
      },
      {
        name: 'q2',
        type: 'input',
        message: 'Q 1 2'
      }
    ])
  } catch (e) {
    expect(e.message).toEqual('Unknow value for question q2')
  }
})
