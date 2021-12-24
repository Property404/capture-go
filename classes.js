"use strict";
import {sleep} from './utils.js';

function clearBlock(ctx, x, y, grid_size)
{
	drawBlock(ctx,x,y,grid_size);
}

function drawBlock(ctx, x, y, grid_size, color)
{
	x = x*ctx.canvas.width/grid_size;
	y = y*ctx.canvas.height/grid_size;

	ctx.save();
	ctx.fillStyle = color;
	//(color?ctx.fillRect:ctx.clearRect)
	ctx.fillRect
		(x,y,ctx.canvas.width/grid_size,ctx.canvas.height/grid_size);
	ctx.restore()
}

export const Direction = Object.freeze({
    UP:   Symbol("up"),
    DOWN:  Symbol("down"),
    LEFT: Symbol("left"),
    RIGHT: Symbol("right")
});

class Point
{
	constructor(x,y)
	{
		this.place(x,y);
	}

	equals(point)
	{
		return this.x === point.x && this.y === point.y;
	}

	place(x,y)
	{
		if(
			typeof x !== "number"||
			typeof y !== "number"
		)
			throw new Error("Can't place point at non-numeric position");
		this.x = x;
		this.y = y;
	}

	distanceFrom(x, y)
	{
		if(x instanceof Point)
		{
			y = x.y;
			x = x.x;
		}
		return Math.sqrt((this.x-x)**2 + (this.y-y)**2);
	}
}

export class Food extends Point
{
	color = "yellow";

	constructor(context, grid_size)
	{
		super(0,0);
		this.context = context;
		this.grid_size = grid_size;
		this.placeRandomly();
	}

	draw()
	{
		drawBlock(this.context, this.x, this.y, this.grid_size, this.color)
	}
	clear()
	{
		clearBlock(this.context, this.x, this.y, this.grid_size)
	}

	placeRandomly()
	{
		this.place(
			Math.floor(Math.random()*this.grid_size),
			Math.floor(Math.random()*this.grid_size)
		);
	}
}




export class Snake
{
	parts = []
	_direction = Direction.UP;
	color = "white";
	
	constructor(context, initial_x, initial_y, grid_size)
	{
		if(context && context instanceof Snake)
		{
			context.assimilate(this)
		}
		else
		{
			this.context = context;
			this.grid_size = grid_size;
			this.parts.push(new Point(initial_x, initial_y));

			if(!context || !grid_size)
				throw("Snake constructor incomplete arguments");

			if(context.canvas.width%grid_size)
				throw("Snake created with invalid grid size");
		}
	}

	// Copy ourself over to a new object
	// Effectively making a clone (though we don't create the object ourself)
	assimilate(snake)
	{
		snake._direction = this._direction;
		snake.color = this.color;
		snake.grid_size = this.grid_size;
		snake.parts.length = 0;
		for(const part of this.parts)
		{
			if(part)
				snake.parts.push(new Point(part.x, part.y));
			else
				snake.parts.push(null);
		}
		for(let i=0;i<this.parts.length;i++)
		{
			if(this.parts[i] === null && snake.parts[i] === null)
				continue;
			if(!this.parts[i].equals(snake.parts[i]))
				throw("FUCKING FUCKBALLS");
		}
	}

	async startDeathAnimation()
	{
		let delay = 90;
		for(const part of this.parts)
		{
			if(part)
			{
				await sleep(delay);
				if(delay>30)delay--;
				clearBlock(this.context, part.x, part.y, this.grid_size);
			}
		}
	}


	canMoveInDirection(new_direction)
	{
		if(new_direction == this._direction) return true;
		if
		(
			this.neck &&
			(
				(
					(this.head.x < this.neck.x ||
						this.head.x > this.neck.x)&&
					(new_direction == Direction.RIGHT ||
						new_direction == Direction.LEFT)
				)||
				(
					(this.head.y < this.neck.y ||
						this.head.y > this.neck.y)&&
					(new_direction == Direction.UP ||
						new_direction == Direction.DOWN)
				)
			)
		)
		{return false;}
		return true;
	}
	get direction()
	{
		return this._direction
	}
	set direction(new_direction)
	{
		if(this.canMoveInDirection(new_direction))
			this._direction = new_direction;
	}

	get head()
	{
		return this.parts[0];
	}

	get neck()
	{
		if(this.parts.length>1)
			return this.parts[1];
		else
			return null;
	}

	get tail()
	{
		return this.parts[this.parts.length-1];
	}

	printSelf()
	{
		let text = "[";
		for(const part of this.parts)
		{
			if(part)
				text += ` (${part.x}, ${part.y})`
			else
				text+= ' -'
		}
		text+=" ]";
		console.log(text);
	}

	update()
	{
		// Clear tail
		if (this.context && this.tail)
		{
			clearBlock(this.context,
				this.tail.x,
				this.tail.y,
				this.grid_size
			);
		}
		
		// Shift snake up
		for(let i=this.parts.length-1;i>0;i--)
		{
			if(this.parts[i])

				this.parts[i].place(
					this.parts[i-1].x,
					this.parts[i-1].y);
			else
			{
				if(this.parts[i-1])
					this.parts[i] = new Point(this.parts[i-1].x,this.parts[i-1].y);
			}
		}
		switch(this._direction)
		{
			case Direction.UP:
				this.head.y--;
				break;
			case Direction.DOWN:
				this.head.y++;
				break;
			case Direction.LEFT:
				this.head.x--;
				break;
			case Direction.RIGHT:
				this.head.x++;
				break;
			default:
				throw "eh";
		}

		// Keep within bounds of walls
		if(this.head.x < 0)
			this.head.x += this.grid_size;
		if(this.head.y < 0)
			this.head.y += this.grid_size;
		if(this.head.x >= this.grid_size)
			this.head.x -= this.grid_size;
		if(this.head.y >= this.grid_size)
			this.head.y -= this.grid_size;
		
		if(this.context)
			drawBlock(this.context,
				this.head.x,
				this.head.y,
				this.grid_size,
				this.color);
	}

	// Increase snake length
	extend(value)
	{
		if(typeof value !== "number" || value <0)
			throw("Snake.extend: invalid value");
		for(let i=0;i<value;i++)
			this.parts.push(null);
	}

	// Check if we intersect with another snake (including ourself)
	// Though, that is a special case
	headMeetsSnake(snake)
	{
		if(this !== snake)
		{
			if(this.head.equals(snake.head))
				return true;
		}
		for(let i=1;i<snake.parts.length;i++)
		{
			const part = snake.parts[i];
			if(!part)break;
			if(this.head.equals(part))
				return true;
		}
		return false;
	}

	intersectsPoint(point)
	{
		return this.intersects(point.x, point.y);
	}

	intersects(x,y)
	{
		for(const part of this.parts)
		{
			if(part)
			{
				if(part.x === x && part.y === y)
				{
					return true;
				}
			}
		}
		return false;
	}
}
