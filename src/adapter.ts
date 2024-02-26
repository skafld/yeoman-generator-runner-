import {Question, Answers} from 'inquirer'
import TerminalAdapter from 'yeoman-environment/lib/adapter'

export class StorageAdapter extends TerminalAdapter {
  answers: Answers

  constructor(answers: Answers, options: TerminalAdapter.AdapterOptions = {}) {
    super(options)
    this.answers = answers
  }

  async prompt<Q, A>(questions: TerminalAdapter.Questions<Q>): Promise<A> {
    const list = questions as readonly Question<Q>[]
    const answers = this.reply(list)

    return Promise.resolve(answers as A)
  }

  private reply<Q, A>(questions: readonly Question<Q>[]): Answers {
    const result: Record<string, A> = {}

    for (const question of questions) {
      const name: string = question.name as string
      const answer = this.findAnswer(name, question)

      result[name] = answer as A
    }

    return result
  }

  private findAnswer<Q, A>(name: string, question: Question<Q>): A {
    if (!this.answers.hasOwnProperty(name) && question.default === undefined) {
      throw new Error(`Unknow value for question ${name}`)
    }

    return this.answers.hasOwnProperty(name) ? this.answers[name] : question.default
  }
}
