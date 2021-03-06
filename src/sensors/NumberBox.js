import React, { Component } from "react";
import { Button ,Icon ,Text } from "native-base";
import { connect } from "react-redux";
import { View ,FlatList } from "react-native";
import { addComponent, removeComponent, watchComponent, updateQuery, setQueryOptions } from "../actions";
import { isEqual, getQueryOptions, pushToAndClause } from "../utils/helper";
import NumberBoxCard from "./NumberBoxCard.js";


class NumberBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentValue:0,
			options:this.props.data
		};
		this.type = "Term";
		this.internalComponent = this.props.componentId + "__internal";
	}

	componentDidMount() {
		this.props.addComponent(this.internalComponent);
		this.props.addComponent(this.props.componentId);
		this.setReact(this.props);

		const queryOptions = getQueryOptions(this.props);
		queryOptions.aggs = {
			[this.props.dataField]: {
				terms: {
					field: this.props.dataField,
					size: 100,
					order: {
						_count: "desc"
					}
				}
			}
		}
		//this.props.setQueryOptions(this.internalComponent, queryOptions);
		//this.props.updateQuery(this.internalComponent, null);
	}

	componentWillReceiveProps(nextProps) {
		if (!isEqual(nextProps.react, this.props.react)) {
			this.setReact(nextProps);
		}
		if (!isEqual(nextProps.options, this.props.options)) {
			this.setState({
				options: nextProps.data || []
			});
		}
	}

	componentWillUnmount() {
		this.props.removeComponent(this.props.componentId);
		this.props.removeComponent(this.internalComponent);
	}

	setReact(props) {
		const { react } = props;
		if (react) {
			newReact = pushToAndClause(react, this.internalComponent);
			props.watchComponent(props.componentId, newReact);
		} else {
			props.watchComponent(props.componentId, { and: this.internalComponent });
		}
	}

	defaultQuery(value) {
		if (this.selectAll) {
			return {
				exists: {
					field: [this.props.dataField]
				}
			};
		} else if (value) {
			return {
				[this.type]: {
					[this.props.dataField]: value
				}
			};
		}
	}

	setValue = (value) => {
		this.setState({
			currentValue: value
		});
		//this.props.updateQuery(this.props.componentId, this.defaultQuery(value))
	};

	render() {
		return (
			<View style={{ padding:5 }}>
				<Text style={{ fontSize:16 ,fontWeight:"bold" }}>{this.props.title?this.props.title:""}</Text>
				<FlatList
					data={this.state.options}
					renderItem={({ item }) => (
						<NumberBoxCard
							start={item.start}
							end={item.start}
							label={item.label}
							defaultSelected={this.props.defaultSelected}
						/>
					)}
				/>
			</View>
		);
	}
}
// NumberBox.propTypes = {
// 	componentId:PropTypes.string,
// 	queryFormat:PropTypes.string,
// 	dataField:PropTypes.string,
// 	data:PropTypes.object,
// 	title:PropTypes.string,
//  defaultSelected:PropTypes.number,
// 	labelPosition:PropTypes.string,
// 	queryFormat:PropTypes.string,
// 	showFilter:PropTypes.bool,
// 	filterLabel:PropTypes.string,
// 	URLParams:PropTypes.bool
// };
NumberBox.defaultProps = {
	queryFormat:"gte",
	showFilter:true,
	//filterLabel:this.props.componentId,
	URLParams:false
}

const mapStateToProps = (state, props) => ({
	options: state.aggregations[props.componentId]
});

const mapDispatchtoProps = dispatch => ({
	addComponent: component => dispatch(addComponent(component)),
	removeComponent: component => dispatch(removeComponent(component)),
	watchComponent: (component, react) => dispatch(watchComponent(component, react))
	//updateQuery: (component, query) => dispatch(updateQuery(component, query)),
	//setQueryOptions: (component, props) => dispatch(setQueryOptions(component, props))
});

export default connect(mapStateToProps, mapDispatchtoProps)(NumberBox);
