/*
 * Copyright (C) 2016  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

// @flow

// import {debounce} from 'lodash';
import request from 'superagent-bluebird-promise';


export const UPDATE_DISAMBIGUATION_FIELD = 'UPDATE_DISAMBIGUATION_FIELD';
export const UPDATE_LANGUAGE_FIELD = 'UPDATE_LANGUAGE_FIELD';
export const UPDATE_NAME_FIELD = 'UPDATE_NAME_FIELD';
export const UPDATE_SORT_NAME_FIELD = 'UPDATE_SORT_NAME_FIELD';
export const UPDATE_WARN_IF_EXISTS = 'UPDATE_WARN_IF_EXISTS';

export type Action = {
	type: string,
	payload?: mixed,
	metadata?: {
		debounce?: string
	}
};

/**
 * Produces an action indicating that the name for the entity being edited
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newName - The new value to be used for the name.
 * @returns {Action} The resulting UPDATE_NAME_FIELD action.
 */
export function debouncedUpdateNameField(newName: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newName,
		type: UPDATE_NAME_FIELD
	};
}

/**
 * Produces an action indicating that the sort name for the entity being edited
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newSortName - The new value to be used for the sort name.
 * @returns {Action} The resulting UPDATE_SORT_NAME_FIELD action.
 */
export function debouncedUpdateSortNameField(newSortName: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newSortName,
		type: UPDATE_SORT_NAME_FIELD
	};
}

/**
 * Produces an action indicating that the language of the name for the entity
 * being edited should be updated with the provided value.
 *
 * @param {string} newLanguageId - The new value to be used for the language ID.
 * @returns {Action} The resulting UPDATE_LANGUAGE_FIELD action.
 */
export function updateLanguageField(newLanguageId: ?number): Action {
	return {
		payload: newLanguageId,
		type: UPDATE_LANGUAGE_FIELD
	};
}

/**
 * Produces an action indicating that the disambiguation for the entity being
 * edited should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newDisambiguation - The new value to be used for the
 *        disambiguation.
 * @returns {Action} The resulting UPDATE_SORT_NAME_FIELD action.
 */
export function debouncedUpdateDisambiguationField(
	newDisambiguation: string
): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newDisambiguation,
		type: UPDATE_DISAMBIGUATION_FIELD
	};
}

/*
 * Return a function which dispatches action to update the name field and
 * asynchronously checks if it already exists in the database, dispatching
 * action to update the warning if the name exists or not.
 * @param  {string} newName - The new value to be used for the name.
 * @param  {string} entityType - The entityType of the value.
 * @return {(Action) => mixed} Thunk action.
 */
export function handleNameChange(
	newName: string,
	entityType: string
): ((Action) => mixed) => mixed {
	return (dispatch) => {
		dispatch({
			meta: {debounce: 'keystroke'},
			payload: newName,
			type: UPDATE_NAME_FIELD
		});

		request.get('/search/exists')
			.query({
				collection: entityType,
				q: newName
			})
			.then(res => dispatch({
				meta: {debounce: 'keystroke'},
				payload: res.text === 'true',
				type: UPDATE_WARN_IF_EXISTS
			}))
			.catch((error: {message: string}) => error);

		/*
		 * Between these two actions, only the one which is dispatched later
		 * takes effect. Why???
		 * WIP: Add debounced querying => but that would cause writing of
		 * another function, which would take dispatch as argument. Not sure if
		 * it becomes anti-pattern?
		 */
	};
}
