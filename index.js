#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import Table from 'cli-table3'
import fs from 'fs/promises'
import figlet from "figlet"

const program = new Command()
const sourceFile = "tasks.json"

//console.log(
//  chalk.cyan(figlet.textSync("Task Tracker CLI", { horizontalLayout: "full" }))
//)

program
  .name('task-tracker-cli')
  .description('A CLI app to track your all tasks')
  .version('1.0.0')

// List all tasks
async function readAllTasks() {
  try {
    const data = await fs.readFile(sourceFile)

    return JSON.parse(data)
  }
  catch (err) {
    console.error("Error reading file:", err)
    throw err
  }
}

program
  .command('list [option]')
  .description('List tasks')
  .action(async (option) => {
    const allTasks = await readAllTasks()

    if (![undefined, "done", "todo", "in-progress"].includes(option)) {
      console.error(chalk.red("Invalid option, it should be 'done', 'todo', 'in-progress', or blank"))
      process.exit(1)
    }

    let taskTable = new Table({
      head: ["ID", "Description", "Status"],
    })

    for (let i = 0; i < allTasks.length; i++) {

      let id = allTasks[i].id
      let description = allTasks[i].task
      let status = allTasks[i].status

      if (!option) {
        if (status === "done")
          taskTable.push([chalk.green(id), chalk.green(description), chalk.green(status)])
        else if (status === "todo")
          taskTable.push([chalk.blue(id), chalk.blue(description), chalk.blue(status)])
        else if (status === "in-progress")
          taskTable.push([chalk.yellow(id), chalk.yellow(description), chalk.yellow(status)])
      }
      else if (option === status) {
        taskTable.push([id, description, status])
      }
    }
    console.log(taskTable.toString())
  })

// Add new task
async function addTask(task) {
  let allTasks = await readAllTasks()
  let newId = allTasks.length === 0 ? 1 : Math.max(...allTasks.map(task => task.id)) + 1
  let currentDate = new Date()
  currentDate = currentDate.toISOString().slice(0, 10);
  allTasks.push({ id: newId, task: task, status: "todo", createdAt: currentDate, updatedAt: currentDate })

  console.log(allTasks)

  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(sourceFile, data)
    console.log(`New task added - "${task}"`)
  }
  catch (err) {
    console.log("Error adding task:", err)
    throw err
  }
}

program
  .command('add <task>')
  .description('Add new task')
  .action(async (task) => {
    await addTask(task)
  })


// Delete new task
async function deleteTask(taskId) {
  let allTasks = await readAllTasks()
  let deleteIndex = allTasks.findIndex((val) => val.id === parseInt(taskId))

  if (deleteIndex > -1) {
    allTasks.splice(deleteIndex, 1);
  }

  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(sourceFile, data)
    console.log(`"${taskId}" - Task deleted`)
  }
  catch (err) {
    console.log("Error removing task:", err)
    throw err
  }
}

program
  .command('delete <id>')
  .description('Delete task using id')
  .action(async (taskId) => {
    await deleteTask(taskId)
  })

// Mark done/ in-progress/ todo
async function editStatus(taskId, status) {
  let allTasks = await readAllTasks()
  for (let i = 0; i < allTasks.length; i++) {
    if (allTasks[i].id === parseInt(taskId)) {
      allTasks[i].status = status
      const currentDate = new Date()
      allTasks[i].updatedAt = currentDate.toISOString().slice(0, 10);
      break
    }
  }

  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(sourceFile, data)
    console.log(`"${taskId}" - Marked ${status}`)
  }
  catch (err) {
    console.log("Error marking complete:", err)
    throw err
  }
}

program
  .command('mark-done <id>')
  .description('Mark a task completed')
  .action(async (taskId) => {
    await editStatus(taskId, "done")
  })

program
  .command('mark-in-progress <id>')
  .description('Mark a task completed')
  .action(async (taskId) => {
    await editStatus(taskId, "in-progress")
  })

program
  .command('mark-todo <id>')
  .description('Mark a task completed')
  .action(async (taskId) => {
    await editStatus(taskId, "todo")
  })

// Edit tasks
async function editTasks(taskId, updatedTask) {
  let allTasks = await readAllTasks()
  for (let i = 0; i < allTasks.length; i++) {
    if (allTasks[i].id === parseInt(taskId)) {
      allTasks[i].task = updatedTask
      break
    }
  }

  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(sourceFile, data)
    console.log(`"${taskId}" - Task updated`)
  }
  catch (err) {
    console.log("Error updating task:", err)
    throw err
  }
}

program
  .command('update <id> <task>')
  .description('Update a task using id')
  .action(async (id, task) => {
    await editTasks(id, task)
  })

program.parse()

const options = program.opts()
