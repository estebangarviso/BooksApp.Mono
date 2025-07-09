/* eslint-disable @typescript-eslint/no-explicit-any */
import { Status } from './enums';
export interface ExampleInterface {
	id: string;
	name: string;
	status: Status;
	data?: any; // Optional field for additional data
}
