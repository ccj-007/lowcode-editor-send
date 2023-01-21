import { makeAutoObservable } from 'mobx'

export class EditorStore {
  isMobile = false

  constructor() {
    makeAutoObservable(this)
  }

  changeMobile = (mobile: boolean) => {
    this.isMobile = !mobile
  }
}