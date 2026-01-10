import { Task } from "../types.js"
import fs from 'fs/promises'
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = resolve(__dirname, "..", "..")
export const TASKS_FILE_PATH = resolve(projectRoot, "tasks.json")

export async function readAllTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE_PATH, "utf-8")
    const parsed = JSON.parse(data)

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid tasks file format")
    }

    return parsed as Task[]
  }
  catch (err: any) {
    if (err.code === "ENOENT") {
      await writeAllTasks([])
      return []
    }

    console.error("Error reading tasks:", err)
    throw err
  }
}

async function atomicWriteFile(
  filePath: string,
  data: string
): Promise<void> {
  const tempPath = `${filePath}.temp`

  await fs.writeFile(tempPath, data)
  await fs.rename(tempPath, filePath)
}

export async function writeAllTasks(tasks: Task[]): Promise<void> {
  try {
    const data = JSON.stringify(tasks, null, 2)
    await atomicWriteFile(TASKS_FILE_PATH, data)
  }
  catch (err) {
    console.error("Error writing tasks: ", err)
    throw err
  }
}

async function persistTasks(
  updater: (tasks: Task[]) => Task[] | void
): Promise<void> {
  const tasks = await readAllTasks()

  const updatedTasks = updater(tasks) ?? tasks

  await writeAllTasks(updatedTasks)
}

export async function addTask(description: string): Promise<void> {
  await persistTasks(tasks => {
    tasks.push({
      id: tasks.length === 0 ? 1 : Math.max(...tasks.map(task => task.id)) + 1,
      description: description,
      status: "todo",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    })
  })
}


export async function deleteTask(taskId: string): Promise<void> {
  await persistTasks(tasks => {
    const index = tasks.findIndex(t => t.id === parseInt(taskId))
    if (index === -1)
      throw new Error("Task not found")
    tasks.splice(index, 1)
  })
}

export async function editStatus(taskId: string, status: Task["status"]): Promise<void> {
  await persistTasks(tasks => {
    const task = tasks.find(t => t.id === parseInt(taskId))
    if (!task)
      throw new Error("Task not found")
    task.status = status
    task.updatedAt = new Date().toISOString().slice(0, 10)
  })
}

export async function editTasks(taskId: string, updatedTask: string): Promise<void> {

  await persistTasks(tasks => {
    const task = tasks.find(t => t.id === parseInt(taskId))
    if (!task)
      throw new Error("Task not found")
    task.description = updatedTask
    task.updatedAt = new Date().toISOString().slice(0, 10)
  })
}
