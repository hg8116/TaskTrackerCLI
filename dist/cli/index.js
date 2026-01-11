import { Command } from "commander";
import { addTask, deleteTask, editStatus, editTasks, readAllTasks } from "../core/taskServices.js";
import chalk from "chalk";
import Table from 'cli-table3';
export function runCli(argv) {
    function withErrorHandling(fn) {
        return (...args) => fn(...args).catch(err => {
            console.log(chalk.red(err.message ?? "Unexpected error"));
            process.exit(1);
        });
    }
    const program = new Command();
    program
        .name('task-tracker-cli')
        .description('A CLI app to track your all tasks')
        .version('1.0.0');
    // List all tasks
    program
        .command('list [option]')
        .alias('ls')
        .description('List tasks')
        .action(withErrorHandling(async (option) => {
        const allTasks = await readAllTasks();
        if (![undefined, "done", "todo", "in-progress"].includes(option)) {
            throw new Error("Invalid option...");
        }
        let taskTable = new Table({
            head: ["ID", "Description", "Status"],
        });
        for (let i = 0; i < allTasks.length; i++) {
            let id = allTasks[i]?.id;
            let description = allTasks[i]?.description;
            let status = allTasks[i]?.status;
            if (!option) {
                if (status === "done")
                    taskTable.push([chalk.green(id), chalk.green(description), chalk.green(status)]);
                else if (status === "todo")
                    taskTable.push([chalk.blue(id), chalk.blue(description), chalk.blue(status)]);
                else if (status === "in-progress")
                    taskTable.push([chalk.yellow(id), chalk.yellow(description), chalk.yellow(status)]);
            }
            else if (option === status) {
                taskTable.push([id, description, status]);
            }
        }
        console.log(taskTable.toString());
    }));
    // Add new task
    program
        .command('add <task>')
        .alias('a')
        .description('Add new task')
        .action(withErrorHandling(async (task) => {
        const newTask = await addTask(task);
        console.log(chalk.green(`✓ Added task #${newTask.id}: ${newTask.description}`));
    }));
    // Delete new task
    program
        .command('delete <id>')
        .alias('rm')
        .description('Delete task using id')
        .action(withErrorHandling(async (taskId) => {
        if (Number.isNaN(Number(taskId)))
            throw new Error("Task ID must be a number");
        const isDeleted = await deleteTask(taskId);
        if (isDeleted)
            console.log(chalk.green(`✓ Deleted task #${taskId}`));
        else
            throw new Error(`✗ Task #${taskId} not found`);
    }));
    // Mark done/ in-progress/ todo
    program
        .command('mark-done <id>')
        .alias('md')
        .description('Mark a task completed')
        .action(withErrorHandling(async (taskId) => {
        if (Number.isNaN(Number(taskId)))
            throw new Error("Task ID must be a number");
        const isUpdated = await editStatus(taskId, "done");
        if (isUpdated)
            console.log(chalk.green(`✓ Updated task #${taskId}`));
        else
            throw new Error(`✗ Task #${taskId} not found`);
    }));
    program
        .command('mark-in-progress <id>')
        .alias('mip')
        .description('Mark a task completed')
        .action(withErrorHandling(async (taskId) => {
        if (Number.isNaN(Number(taskId)))
            throw new Error("Task ID must be a number");
        const isUpdated = await editStatus(taskId, "in-progress");
        if (isUpdated)
            console.log(chalk.green(`✓ Updated task #${taskId}`));
        else
            throw new Error(`✗ Task #${taskId} not found`);
    }));
    program
        .command('mark-todo <id>')
        .alias('mt')
        .description('Mark a task completed')
        .action(withErrorHandling(async (taskId) => {
        if (Number.isNaN(Number(taskId)))
            throw new Error("Task ID must be a number");
        const isUpdated = await editStatus(taskId, "todo");
        if (isUpdated)
            console.log(chalk.green(`✓ Updated task #${taskId}`));
        else
            throw new Error(`✗ Task #${taskId} not found`);
    }));
    // Edit tasks
    program
        .command('update <id> <task>')
        .alias('u')
        .description('Update a task using id')
        .action(withErrorHandling(async (taskId, task) => {
        if (Number.isNaN(Number(taskId)))
            throw new Error("Task ID must be a number");
        const isUpdated = await editTasks(taskId, task);
        if (isUpdated)
            console.log(chalk.green(`✓ Updated task #${taskId}`));
        else
            throw new Error(`✗ Task #${taskId} not found`);
    }));
    program.parse(argv);
}
