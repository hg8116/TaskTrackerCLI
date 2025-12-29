#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from 'fs/promises'

const program = new Command()
const sourceFile = "tasks.json"

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
  .command('list')
  .description('List all tasks')
  .action(async () => {
    const allTasks = await readAllTasks()

    for (let i = 0; i < allTasks.length; i++) {

      let id = allTasks[i].id
      let task = allTasks[i].task
      let status = allTasks[i].status

      console.log(id, ' - ', task, ' - ', status)
    }
  })

// Add new task
async function addTask(task) {
  let allTasks = await readAllTasks()
  allTasks.push({ id: allTasks.length + 1, task: task, status: "incomplete" })

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

  console.log(deleteIndex)

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

// Mark complete
async function markComplete(taskId) {
  let allTasks = await readAllTasks()
  for (let i = 0; i < allTasks.length; i++) {
    if (allTasks[i].id === parseInt(taskId)) {
      allTasks[i].status = "Completed"
      break
    }
  }

  try {
    const data = JSON.stringify(allTasks)
    await fs.writeFile(sourceFile, data)
    console.log(`"${taskId}" - Marked completed`)
  }
  catch (err) {
    console.log("Error marking complete:", err)
    throw err
  }
}

program
  .command('completed <id>')
  .description('Mark a task completed')
  .action(async (taskId) => {
    await markComplete(taskId)
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

//program
//  .command('create')
//  .description('Create a new item with interactive input')
//  .action(async () => {
//    const answers = await inquirer.prompt([
//      {
//        type: 'input',
//        name: 'name',
//        message: 'Enter the item name:',
//        validate: (input) => input.length >= 3 ? true : 'The name must be at least 3 characters long.'
//      },
//      {
//        type: 'list',
//        name: 'type',
//        message: 'Select the item type:',
//        choices: ['default', 'special', 'custom']
//      }
//    ])
//
//    console.log(chalk.green(`Successfully created item "${answers.name}" of type "${answers.type}"`))
//  })

program.parse()

const options = program.opts()
if (options.debug) {
  console.log('Debug mode is enabled')
  console.log('Options: ', options)
}
