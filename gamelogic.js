const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const game = {
    start: function() {
        console.log("Welcome to the Adventure Game!");
        console.log("You find yourself in a dark forest. There are paths to the north, south, east, and west.");
        this.choosePath();
    },
    
    choosePath: function() {
        rl.question("Which direction do you want to go? (north/south/east/west): ", (direction) => {
            switch(direction.toLowerCase()) {
                case 'north':
                    this.northPath();
                    break;
                case 'south':
                    this.southPath();
                    break;
                case 'east':
                    this.eastPath();
                    break;
                case 'west':
                    this.westPath();
                    break;
                default:
                    console.log("Invalid direction. Please choose north, south, east, or west.");
                    this.choosePath();
                    break;
            }
        });
    },
    
    northPath: function() {
        console.log("You head north and find a river. You can either swim across or go back.");
        rl.question("Do you want to swim across or go back? (swim/back): ", (choice) => {
            if (choice.toLowerCase() === 'swim') {
                console.log("You swim across the river and find a treasure chest! You win!");
                rl.close();
            } else {
                this.choosePath();
            }
        });
    },
    
    southPath: function() {
        console.log("You head south and encounter a wild animal. You can either fight or run.");
        rl.question("Do you want to fight or run? (fight/run): ", (choice) => {
            if (choice.toLowerCase() === 'fight') {
                console.log("You bravely fight the animal and win! You find a hidden path leading to a treasure chest. You win!");
                rl.close();
            } else {
                this.choosePath();
            }
        });
    },
    
    eastPath: function() {
        console.log("You head east and find a village. The villagers welcome you and offer you food and shelter. You win!");
        rl.close();
    },
    
    westPath: function() {
        console.log("You head west and find a mountain. You can either climb the mountain or go back.");
        rl.question("Do you want to climb the mountain or go back? (climb/back): ", (choice) => {
            if (choice.toLowerCase() === 'climb') {
                console.log("You climb the mountain and find a cave with a treasure chest inside. You win!");
                rl.close();
            } else {
                this.choosePath();
            }
        });
    }
};

game.start();