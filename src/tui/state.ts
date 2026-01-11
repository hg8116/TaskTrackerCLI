import { readAllTasks, writeAllTasks } from "../core/taskServices.js";
import { Task } from "../types.js";

export let currentTasks: Task[] = []

export async function loadState() {
  currentTasks = await readAllTasks()
}

export async function saveState(tasks: Task[]) {
  currentTasks = tasks
  await writeAllTasks(tasks)
}
