import { Task } from "../types.js";

export class HistoryManager {
  private undoStack: Task[][] = []
  private redoStack: Task[][] = []

  snapshot(tasks: Task[]) {
    this.undoStack.push(structuredClone(tasks))
    this.redoStack = []
  }

  undo(current: Task[]): Task[] | null {
    if (this.undoStack.length === 0)
      return null
    this.redoStack.push(structuredClone(current))
    return this.undoStack.pop()!
  }

  redo(current: Task[]): Task[] | null {
    if (this.redoStack.length === 0)
      return null
    this.undoStack.push(structuredClone(current))
    return this.redoStack.pop()!
  }
}
