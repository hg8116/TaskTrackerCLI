import { Task } from "../types.js"
import fs from 'fs/promises'
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import { stderr } from "process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = resolve(__dirname, "..", "..")
export const TASKS_FILE_PATH = resolve(projectRoot, "tasks.json")

export async function readAllTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE_PATH, { encoding: "utf-8" })

    return JSON.parse(data) as Task[]
  }
  catch (err) {
    console.error("Error reading file:", err)
    throw err
  }
}

export async function writeAllTasks(allTasks: Task[]): Promise<void> {
  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(TASKS_FILE_PATH, data)
  }
  catch (err) {
    console.log("Error writing tasks: ", err)
    throw err
  }
}

export async function addTask(task: string): Promise<void> {
  let allTasks = await readAllTasks()
  let newId = allTasks.length === 0 ? 1 : Math.max(...allTasks.map(task => task.id)) + 1
  let currentDate = new Date()
  let formattedDate = currentDate.toISOString().slice(0, 10);
  allTasks.push({ id: newId, description: task, status: "todo", createdAt: formattedDate, updatedAt: formattedDate })

  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(TASKS_FILE_PATH, data)
    console.log(`New task added - "${task}"`)
  }
  catch (err) {
    console.log("Error adding task:", err)
    throw err
  }
}


export async function deleteTask(taskId: string): Promise<void> {
  let allTasks = await readAllTasks()
  let deleteIndex = allTasks.findIndex((val) => val.id === parseInt(taskId))

  if (deleteIndex > -1) {
    allTasks.splice(deleteIndex, 1);
  }

  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(TASKS_FILE_PATH, data)
    console.log(`"${taskId}" - Task deleted`)
  }
  catch (err) {
    console.log("Error removing task:", err)
    throw err
  }
}

export async function editStatus(taskId: string, status: Task["status"]): Promise<void> {
  let allTasks: Task[] = await readAllTasks()
  for (let i = 0; i < allTasks.length; i++) {
    let task = allTasks[i]
    if (!task)
      continue

    if (task.id === parseInt(taskId)) {
      task.status = status
      const currentDate = new Date()
      task.updatedAt = currentDate.toISOString().slice(0, 10);
      break
    }
  }

  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(TASKS_FILE_PATH, data)
    console.log(`"${taskId}" - Marked ${status}`)
  }
  catch (err) {
    console.log("Error marking complete:", err)
    throw err
  }
}

export async function editTasks(taskId: string, updatedTask: string): Promise<void> {
  let allTasks = await readAllTasks()
  for (let i = 0; i < allTasks.length; i++) {
    let task = allTasks[i]
    if (!task)
      continue
    if (task.id === parseInt(taskId)) {
      task.description = updatedTask
      break
    }
  }

  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(TASKS_FILE_PATH, data)
    console.log(`"${taskId}" - Task updated`)
  }
  catch (err) {
    console.log("Error updating task:", err)
    throw err
  }
}
