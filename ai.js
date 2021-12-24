import {Direction, Snake} from './classes.js'
import {sleep} from './utils.js';

const LOW_SCORE = -1000;

export class SnakeAI
{
	forethought = 2;
	constructor(snake, food, grid_size, peers)
	{
		this.snake = snake;
		this._food= food;
		this._grid_size = grid_size;
		this._peers = peers
	}
	
	_scoreOutcome(snake, food)
	{
		for(const peer of this._peers)
		{
			for(const part of peer.parts)
			{
				if(part===null)break;

				if(part === snake.head)
					continue;

				// We fucked up!
				if(part.equals(snake.head))
					return LOW_SCORE;
			}
		}

		let value = 0;

		// Ay! We got it!
		if(snake.head.equals(food))
		{
			value += 100;
		}

		if(this.breakingOutOfCurrent(snake,food))
			value += 1;

		// Nothing special
		return value;
	}

	async wait()
	{
		while(this._complete === false)
		{
			await sleep(2);
		}
	}

	diff(a,b)
	{
		let result = a-b;
		while(result<0)
			result+=this._grid_size;
		return result;
	}

	breakingOutOfCurrent(snake, food)
	{
		if(snake.direction == Direction.UP || snake.direction == Direction.DOWN)
			return false;
		if(snake.parts.length < this._grid_size)
			return false;
		let over = false;
		let under = false;
		for(const part of snake.parts)
		{
			if(!part)
				break;
			if(0==part.y)
				under = true;
			if(this._grid_size-1 == part.y)
				over = true;
			if(snake.head.x<food.x)
			{
				if(part.x < snake.head.x)
					return false;
				if(part.x > food.x)
					return false;
			}
			else if (snake.head.x>food.x)
			{
				if(part.x > snake.head.x)
					return false;
				if(part.x < food.x)
					return false;
			}
		}

		if(!under || !over)
			return false;
		snake.color= "blue;"
		return true;
	}

	inBox(snake)
	{
		let left=false;
		let right=false;
		let up=false;
		let down=false;
		for(const part of snake.parts)
		{
			if(part === snake.head)
				continue
			if(!part)break;
			if(part.x === snake.head.x && part.y > snake.head.y)
				down = true;
			if(part.x === snake.head.x && part.y < snake.head.y)
				up = true;
			if(part.y === snake.head.y && part.x < snake.head.x)
				left = true;
			if(part.y === snake.head.y && part.x > snake.head.x)
				right = true;
		}
		return down && up && left && right;
	}

	async moveSnake()
	{
		const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
		this._complete = false;
		let largest_score = -10000;
		let best_direction = null;
		let preferred_direction = null;
		if(this._food)
		{
			const s = this.snake.head;
			const f = this._food;

			if(s.x < f.x)
				preferred_direction = Direction.RIGHT;
			if(s.x > f.x)
				preferred_direction = Direction.LEFT;
			if(s.y < f.y)
				preferred_direction = Direction.DOWN;
			if(s.y > f.y)
				preferred_direction = Direction.UP;
		}
		for(const direction of directions)
		{
			if(!this.snake.canMoveInDirection(direction))
				continue
			const new_snake = new Snake(this.snake);
			new_snake.direction = direction;
			let score = this._determinePathWorth(
					new_snake, this._food, this.forethought);
			if(score>largest_score || (score===largest_score && direction == preferred_direction))
			{
				largest_score = score;
				best_direction = direction;
			}
		}
		if(!best_direction)throw("Need direction");
		this.snake.direction = best_direction;
		this._complete = true;
	}

	_determinePathWorth(snake, food, length)
	{
		if(length<=0)
			return 0;

		snake.update();
		let value = this._scoreOutcome(snake, food);
		if(value <= LOW_SCORE)
			return value;

		const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
		let largest_score = -10000;
		for(const direction of directions)
		{
			if(!snake.canMoveInDirection(direction))
				continue;
			const new_snake = new Snake(snake);
			new_snake.direction = direction;
			let score = this._determinePathWorth(
					new_snake, food, length-1);
			if(score>largest_score)
				largest_score = score;
		}
		value += largest_score;
		return value;
	}
}
