App = {
    loading: false,
    constracts: {},
    load: async () => {
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
    },
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable();
                // Acccounts now exposed
                // web3.eth.sendTransaction({/* ... */ })
            } catch (error) {
                // User denied account access...
                console.log(error);
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            // web3.eth.sendTransaction({/* ... */ })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },
    loadAccount: async () => {
        App.account = web3.eth.accounts[0];
        // personal.unlockAccount(App.account);
        // console.log(App.account);
    },
    loadContract: async () => {
        // 0x05766dF3CCEefA9ecA36d92c547Cdb9DC7BF5960
        const todoList = await $.getJSON('TodoList.json');
        // console.log(todoList);
        App.constracts.TodoList = TruffleContract(todoList);
        // console.log(App.constracts.TodoList);
        App.constracts.TodoList.setProvider(App.web3Provider);
        //   console.log(todoList);
        App.todoList = await App.constracts.TodoList.deployed();
        // console.log(App.todoList);
    },
    render: async () => {
        if (App.loading) {
            return
        }
        App.setLoading(true);
        $('#account').html(App.account)
        await App.renderTasks()
        App.setLoading(false);
    },
    renderTasks: async () => {
        const taskCount = await App.todoList.taskCount();
        const $taskTemplate = $('.taskTemplate');
        // console.log(taskCount.toNumber());
        for (var i = 1; i <= taskCount; i++) {
            // Fetch the task data from the blockchain
            const task = await App.todoList.tasks(i)
            // console.log(task);
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2]

            // Create the html for the task
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                .prop('name', taskId)
                .prop('checked', taskCompleted)
            // .on('click', App.toggleCompleted)

            // Put the task in the correct list
            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }

            // Show the task
            $newTaskTemplate.show()
        }
    },
    createTask: async () => {
        console.log(App.todoList.address);
        App.setLoading(true);
        const content = $('#newTask').val();
        console.log(typeof(content) +" "+content);
        await App.todoList.createTask(content);
        window.location.reload();
    },
    toggleCompleted: async (e) => {
        App.setLoading(true)
        const taskId = e.target.name
        await App.todoList.toggleCompleted(taskId)
        window.location.reload()
    },
    setLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('#loader');
        const content = $('#content');
        if (boolean) {
            loader.show();
            content.hide();
        }
        else {
            loader.hide();
            content.show();
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load();
    })
})