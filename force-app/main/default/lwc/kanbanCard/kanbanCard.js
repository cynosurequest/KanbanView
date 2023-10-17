import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

const FIELDS = ['User.PhotoUrl'];
export default class KanbanCard extends NavigationMixin(LightningElement) {
    @api stage
    @api record
    userPhotoUrl;
    
    
    connectedCallback(){
        console.log('Hey From DragAndDropCard')
        console.log('card'+JSON.stringify(this.record))

        this.userPhotoUrl = this.record.PhotoUrl;
    }
    get isSameStage(){
        return this.stage === this.record.Status
    }
    // navigateTaskHandler(event){
    //     event.preventDefault()
    //     this.navigateHandler(event.target.dataset.Id, 'Opportunity')
    // }
    navigateTaskHandler(event){
        event.preventDefault()
        this.navigateHandler(event.target.dataset.Id, 'User_Story__c')
    }

    navigateTask() {
        //event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.record.Id,
                objectApiName: 'User_Story__c',
                actionName: 'view'
            }
        });
    }

    redirectToContact() {
        // Assuming you have a variable containing the contactId
        const contactId = this.record.Contact; // Replace with the actual contactId
    
        // Use NavigationMixin to navigate to the contact record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: contactId,
                objectApiName: 'Contact',
                actionName: 'view'
            }
        });
    }

    navigateHandler(Id, apiName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: Id,
                objectApiName: apiName,
                actionName: 'view',
            },
        });
    }
    itemDragStart(){
        const event = new CustomEvent('itemdrag', {
            detail: this.record.Id
        })
        this.dispatchEvent(event)
        console('hi')
    }
}