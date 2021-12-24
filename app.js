"use strict";
import {Food, Direction, Snake} from './classes.js'
import {SnakeAI} from './ai.js';
import {sleep} from './utils.js';

const GRID_SIZE = 9;
const ARTIFICIAL_DELAY = 50;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');

let player;

function clearAll()
{
	ctx.clearRect(0,0,canvas.width, canvas.height);
	displayText("");
}

async function countDown()
{
	clearAll();
	for(let i=3;i>=0;i--)
	{
		displayText(i?i:"Get Ready");
		await sleep(500);
	}
	await sleep(200);
	displayText("");
}

async function startGame(config)
{
		player = new Snake(ctx, GRID_SIZE/2,GRID_SIZE/2,GRID_SIZE);
		player.extend(0);
		player.color="rgb(000,200,000)";

		const food = new Food(ctx, GRID_SIZE);
		food.color="rgb(200,200,50)";

		const enemies = [];
		const all_snakes = [player];
		function addEnemy(forethought)
		{
			let x,y;
			do
			{
				x = Math.floor(Math.random()*GRID_SIZE);
				y = Math.floor(Math.random()*GRID_SIZE);
			}while(player.head.distanceFrom(x,y)<5 || player.intersects(x,y));
			const snake = new Snake(ctx, x, y, GRID_SIZE);
			snake.color = COLOR_LIST[Math.floor(Math.random()*COLOR_LIST.length)];
			snake.extend(0);
			const ai = new SnakeAI(snake, food, GRID_SIZE, all_snakes);
			ai.forethought = config.forethought;
			all_snakes.push(snake);
			enemies.push(ai);
		}

		let score = 0;
		let delay = DEFAULT_DELAY;
		let time_passed = Math.floor(ENEMY_SPAWN_DELAY*.10);

		displayScore(score);
		displayHighScore();

		await countDown();
		food.draw();

		while(true)
		{
			// Move all sneks
			for(const snake of all_snakes)
			{
				if(snake)
					snake.update();
			}

			// Determine which snakies bit the dust
			const dead_snakes = [];
			for(const snake of all_snakes)
			{
				for(const peer of all_snakes)
				{
					if(snake.headMeetsSnake(peer))
					{
						dead_snakes.push(snake);
						if(peer === player && snake != player)
						{
							score+=10;
							displayScore(score);
						}
					}
				}
			}

			// Remove dead snakes from our snake pool
			for(const dead_snake of dead_snakes)
			{
				const index = all_snakes.indexOf(dead_snake);
				console.log("Removing dead snake!", dead_snake.color, " ", index);
				all_snakes.splice(index,1);
				if(index)
					enemies.splice(index-1, 1);

				if(all_snakes.includes(dead_snake))
				{
					throw new Error("That ain't right!");
				}
			}

			// Handle snake deaths
			for(const dead_snake of dead_snakes)
			{
				await dead_snake.startDeathAnimation();
				if(dead_snake === player)
				{
					// Game over!
					let text = "Game Over";
					if(score > getHighScore())
					{
						setHighScore(score);
						text += "<br>New High Score!";
					}
					text+= "<br>Press &lt;enter&gt; to play again";
					displayText(text);
					displayHighScore();
					return;
				}
			}

			for(const snake of all_snakes)
			{
				// Check if a snake ate something
				if(snake.intersectsPoint(food))
				{
					if(snake === player)
					{
						score+=1;
						displayScore(score);
					}

					// Get longer
					snake.extend(1);

					// Make new food
					while(snake.intersectsPoint(food))
						food.placeRandomly();
					food.draw();
				}

			}

			// Prepare the cpu snakes for updating
			for(let ai of enemies)
				ai.moveSnake();
			await sleep(delay);
			for(let ai of enemies)
				await ai.wait();

			time_passed+=delay;
			if(time_passed > ENEMY_SPAWN_DELAY && score > 10)
			{
				if(enemies.length < config.number_of_enemies)
				{
					addEnemy(config.forethought);
				}
				time_passed = 0;
			}

		}
}

async function main()
{
	while(true)
	{
		await startGame({
			number_of_enemies: 1,
			forethought:1
		})
		enter_pressed = false;
		while(!enter_pressed)
		{
			await sleep(50);
		}
	}
}

window.onkeydown = function(e)
{
	const key = e.key;
	if(key.includes("Arrow"))
	{
		e.preventDefault();
		if(key === "ArrowUp")
		{
			player.direction = Direction.UP;
		}
		else if(key === "ArrowDown")
		{
			player.direction = Direction.DOWN;
		}
		else if(key === "ArrowLeft")
		{
			player.direction = Direction.LEFT;
		}
		else if(key === "ArrowRight")
		{
			player.direction = Direction.RIGHT;
		}
	}else if(key === "Enter")
	{
		enter_pressed = true;
	}
}
main();
