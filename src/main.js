import d3 from 'd3'
import R from 'ramda'
import stories from './data.json'
import './main.styl'


export default function main() {
	const key_accessor = R.prop('element')
	const value_accessor = R.prop('value')

	const data = R.compose(
		R.reverse,
		R.sortBy(value_accessor),
		R.filter(value_accessor),  // non-zero values
		stories => stories[0].current_factors[0].elements
	)(stories)

	const target_height = 13;


	const margin = {top: 20, right: 20, bottom: 30, left: 40}
	const width = 960 - margin.left - margin.right
	const height = target_height / 0.9 * data.length;

	const x = d3.scale.linear()
			  .range([0, width])

	const y = d3.scale.ordinal()
			.rangeRoundBands([0, height], .1)

	const xAxis = d3.svg.axis()
			.scale(x)
			.orient('top')
			.ticks(6)

	const negative = d => value_accessor(d) < 0


	const svg = d3.select('body').append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


	x.domain(d3.extent(data, value_accessor))
	y.domain(data.map(key_accessor))

	svg.append('g')
		.attr('class', 'x axis')
		//.attr('transform', 'translate(0,' + margin.top + ')')
		.call(xAxis)

	const bar = svg.selectAll('.bar')
		.data(data)
		.enter().append('g')
		.attr('class', d => 'bar ' + (negative(d) ? 'negative' : 'positive'))
		.attr('transform', d => 'translate(' + x(0) + ',' + y(key_accessor(d)) + ')')

	bar.append('rect')
		.attr('width', d => R.compose(x, Math.abs, value_accessor)(d) - x(0))
		.attr('height', y.rangeBand())
		.attr('x', d => negative(d) ? x(value_accessor(d)) - x(0) : 0)

	bar.append('text')
		.attr('class', 'y-label')
		.attr('x', d => negative(d) ? 10 : -10)
		.attr('y', y.rangeBand() * 0.8)
		.text(key_accessor)
}
