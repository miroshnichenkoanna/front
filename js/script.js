let allTasks = [];
let valueInput = '';
let input = null;
let content;
let activeEditTask = null;

const buttonTasksAdd = async () => {
  if (!valueInput.trim()) { return; }

  allTasks.push({
    text: valueInput.trim(),
    isCheck: false,
  });

  const resp = await fetch('http://localhost:8000/createTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      text: valueInput.trim(),
      isCheck: false,
    }),
  });
  let result = await resp.json();
  allTasks  = result.data;
  valueInput = '';
  input.value = '';
  render();
}

const newLocal = 'change';

window.onload = async function init() {
  input = document.getElementById('add-task');
  input.addEventListener('change', updateValue);
  content = document.getElementById('content-page');
  const button = document.querySelector('.add__btn');
  button.addEventListener('click', buttonTasksAdd);

  const resp = await fetch('http://localhost:8000/allTasks', {
    method: "GET"
  });
  let result = await resp.json();
  allTasks  = result.data;
  render();
}

const updateValue = (event) => {
  valueInput = event.target.value;
}

const render = () => {

  while (content && content.firstChild) {
    content.removeChild(content.firstChild);
  };

  allTasks.sort((a, b) => a.isCheck > b.isCheck ? 1 : a.isCheck < b.isCheck ? -1: 0);
  allTasks.forEach((item, index) => {
    const container = document.createElement('div');
    container.id = `task-${index}`;
    container.className = 'task__container';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.isCheck;
    checkbox.onchange = () => {
      onChangeCheckbox(index);
    };

    container.appendChild(checkbox);

    if (index === activeEditTask) {
      const inputTask = document.createElement('input');
      inputTask.type = 'text';
      inputTask.value = item.text;
      inputTask.addEventListener('change', updateTaskText);
      inputTask.addEventListener('blur', doneEditTask);
      container.appendChild(inputTask);
    } else {

    } const text = document.createElement('p');
    text.innerText = item.text;
    text.className = item.isCheck ? 'text__task done__text' : 'text__task';
    container.appendChild(text);

    if (!item.isCheck) {
      if (index === activeEditTask) {
        const imageDone = document.createElement('img');
        imageDone.src = 'img/done.svg';
        imageDone.onclick = () => {
          doneEditTask();
        };

        container.appendChild(imageDone);

      } else {
        const imageEdit = document.createElement('img');
        imageEdit.src = 'img/edit.svg';
        imageEdit.onclick = () => {
          activeEditTask = index;
          render();
        }
        container.appendChild(imageEdit);
      }

      const imageDelete = document.createElement('img');
      imageDelete.src = 'img/close.svg';
      imageDelete.onclick = () => {
        onDeleteTask(index);
      }
      container.appendChild(imageDelete);
    }

    content.appendChild(container);
  });
}

const onChangeCheckbox = async (index) => {
  allTasks[index].isCheck = !allTasks[index].isCheck;

  const resp = await fetch('http://localhost:8000/updateTask', {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id:  allTasks[index].id,
      isCheck: allTasks[index].isCheck
    })

  });
  let result = await resp.json();
  allTasks  = result.data;

  render();
}

const onDeleteTask = async (index) => {
  const deletedItem = allTasks.splice(index, 1)[0];
  
  const resp = await fetch(`http://localhost:8000/deleteTask?id=${deletedItem.id}`, {
    method: "DELETE",
    headers: {
      'Content-type': 'application/json'
     },
  });
  let result = await resp.json();
  allTasks  = result.data;

  render();
}

const updateTaskText = async (event) => {
  allTasks[activeEditTask].text = event.target.value;

  const resp = await fetch('http://localhost:8000/updateTask', {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: event.target.value.trim(),
      id: allTasks[activeEditTask].id,
    })
  });

  let result = await resp.json();
  allTasks  = result.data;
  render();
}

const doneEditTask = () => {
  activeEditTask = null;
  render();
}







