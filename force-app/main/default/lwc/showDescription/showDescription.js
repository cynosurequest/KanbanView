import { LightningElement,api,wire } from 'lwc';
import getDescription from '@salesforce/apex/UserStoryController.getDescription';
export default class ShowDescription extends LightningElement {
    @api recordId
    description

    connectedCallback(){
        console.log(this.recordId + 'recordID');
    }

    @wire(getDescription, { userStoryId: '$recordId' })
    WiredDescription({ error, data }) {
        if (data) {
            this.description = data;
            console.log('data'+data)
        } else if (error) {
            console.error(error);
        }
    }
}