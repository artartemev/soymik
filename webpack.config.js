const path = require('path');
const Uglify = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

var plugins = process.env.NODE_ENV === 'production'
	? [
		new Uglify(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
	]
	: []

module.exports = {
	entry: ['./src/index.js'],
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'app.js'
	},
	plugins,
	module: {
		loaders: [
			{
				loader: 'babel-loader',
				include: [
					path.resolve(__dirname, 'src')
				],
				test: /\.jsx?$/,
				query: {
					plugins: [
						'transform-runtime',
						'transform-object-rest-spread'
					],
					presets: [
						'react',
						["env", {
							"targets": {
								"browsers": [
									"last 2 versions",
									"ie >= 11"
								]
							},
							"useBuiltIns": true
						}],
					]
				}
			},
			{
				test: /\.(jpg|png|svg)$/,
				loader: 'url-loader',
				options: {
					limit: 25000,
				}
			}
		]
	}
};
