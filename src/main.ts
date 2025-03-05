import './style.css'
import SHDPIcon from './icon.svg'
import { readCSV } from './hf'
import { Buffer } from 'buffer';

// @ts-ignore
window.Buffer = Buffer;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://github.com/peterambos/Samsung-Health-Data-Parser" target="_blank">
      <img src="${SHDPIcon}" class="h-24 my-6 mx-auto " alt="Logo" />
    </a>
    <h1>Samsung Health Data Parser</h1>
    <div class="justify-center p-8 rounded my-px-0 mx-auto shadow-md w-full max-w-md">
        <h2 class="text-2xl font-semibold mb-4 text-center">Upload CSV</h2>
        <form id="uploadForm" action="/upload" method="post" enctype="multipart/form-data" class="space-y-4">
            <div>
                <label for="csvFile" class="block my-0 mx-auto text-sm font-medium text-gray-900 dark:text-white">Select CSV File</label>
                <div class="mt-1">
                    <input type="file" name="csvFile" id="csvFile" accept=".csv" class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
                </div>
            </div>
            <div>
                <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-700 hover:bg-red-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Upload</button>
            </div>
        </form>
    </div>
  </div>
`

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm') as HTMLFormElement;

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});

/**
 * Handles form submission by preventing default form submission,
 * getting the form data, extracting the selected file, and passing it
 * to readCSV.
 *
 * @param event - The submit event.
*/
function handleFormSubmit(event: Event) {
  event.preventDefault(); // Prevent default form submission

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  console.log(formData);
  const file = formData.get('csvFile') as File | null;

  if (file) {
    readCSV(file);
  } else {
    console.error('No file selected.');
  }
}
