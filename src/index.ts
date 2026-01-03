#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import Table from 'cli-table3'
import { addTask, deleteTask, editStatus, editTasks, readAllTasks } from "./core/taskServices.js";

const program = new Command()

program
  .name('task-tracker-cli')
  .description('A CLI app to track your all tasks')
  .version('1.0.0')

// List all tasks
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

      let id = allTasks[i]?.id
      let description = allTasks[i]?.description
      let status = allTasks[i]?.status

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

program
  .command('add <task>')
  .description('Add new task')
  .action(async (task) => {
    await addTask(task)
  })


// Delete new task

program
  .command('delete <id>')
  .description('Delete task using id')
  .action(async (taskId) => {
    await deleteTask(taskId)
  })

// Mark done/ in-progress/ todo

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

program
  .command('update <id> <task>')
  .description('Update a task using id')
  .action(async (id, task) => {
    await editTasks(id, task)
  })

program.parse()

// const options = program.opts()
