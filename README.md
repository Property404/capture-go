# Capture Go

[Capture Go](https://en.wikipedia.org/wiki/Capture_Go) is a simplified version of
the
[ancient board game of a similar name](https://en.wikipedia.org/wiki/Go_(game))

The goal is to capture a group of opponent stones by surrounding them on all
orthogonally(i.e. non-diagonal) adjacent sides.

Click the intersections on the board to place your stone.

## 3D Version

The 3D version of capture go is exactly like the 2D version, but with an extra dimension.
A stone placed at [Tengen](https://en.wikipedia.org/wiki/Tengen_(Go)) as the
first move will have 6 liberties instead of 4, with the addition of up and
down in the Z-axis. Use the left and right arrow keys to switch between planes
in the Z axis.

## Running Locally

* `npm install`
* `python3 -m http.server 8000 # Or equivalent`
* Open <http://localhost:8000> in your browser

## License

MIT
