import chalk from "chalk";
import { Spinner } from "cli-spinner";

export function success(message: unknown): void {
  console.info(`[${chalk.green("SUCC")}] ${message}`);
}

export function info(message: unknown): void {
  console.info(`[${chalk.blue("INFO")}] ${message}`);
}

export function error(message: unknown): void {
  console.error(`[${chalk.red("ERROR")}] ${message}`);
}

/**
 * Show a spinner to indicate work being done to the user
 * @param message The message to show while the work is being done
 * @returns A function that, when called, stops the spinner
 */
export function makeSpinner(message: unknown): () => void {
  const spinnerella = new Spinner(`[${chalk.cyan("WORK")}] ${message} %s`);
  spinnerella.start();
  return () => {
    spinnerella.stop();
    console.log();
  };
}
