import { LightningElement, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import NAME_FIELD from '@salesforce/schema/User.Name';

export default class LoggedInUser extends LightningElement {
  userName;

  @wire(getRecord, {
    recordId: USER_ID,
    fields: [NAME_FIELD]
  })
  wireUser({ error, data }) {
    if (data) {
      this.userName = data.fields.Name.value;
    } else if (error) {
      // Handle error if necessary
      console.error(error);
    }
  }
}