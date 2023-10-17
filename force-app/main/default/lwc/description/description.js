import { LightningElement,api,wire } from 'lwc';
import getDescription from '@salesforce/apex/UserStoryController.getDescription';


export default class Description extends LightningElement {


    @api recordId; 
    description;


   
    @wire(getDescription, {userStoryId:'$recordId'})
    wiredDescription({ error, data }) {
        if (data) {
            console.log('data'+data)
            this.description = data;
        } else if (error) {
            console.error('Error fetching description', error);
        }
    }

    
}