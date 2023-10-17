import { LightningElement, wire, api } from 'lwc';
import getComments from '@salesforce/apex/UserStoryController.getComments';
import saveComments from '@salesforce/apex/UserStoryController.saveComments';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Comments extends NavigationMixin(LightningElement ){
    @api recordId;
    comments;
    showPopUp = false;
    cName = ' ';
    commentText = ' '
    LastModifiedDate ;


    connectedCallback(){
        console.log(' Comments'+this.recordId)
        this.getData()
    }

    getData(){
    getComments({ userStoryId:this.recordId })
    .then(result => {
        try {
            this.comments = result;
        for(let i = 0; i < this.comments.length ; i++){
            this.comments[i].LastModifiedDate = formatDate(this.comments[i].LastModifiedDate )
            //console.log(this.LastModifiedDate +' lastmd')
        //this.LastModifiedDate = formatDate(this.comments.LastModifiedDate )
        }
        console.log('comments' + JSON.stringify(this.comments))
        } catch (error) {
            console.log('catch error' + error)
        }
        

    })
    .catch(error => {
        console.log(' get comments error ' + JSON.stringify(error))
    })
    
    }

    handleComments(event){
        const commentId = event.currentTarget.dataset.commentId;
        // Now you have the commentId, you can use it as needed
        console.log('Clicked Comment Id:', commentId);

        // If you want to navigate to the comment record page, you can use NavigationMixin
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: commentId,
                objectApiName: 'Comment__c',
                actionName: 'view',
            },
        });
    }

    handleNewComments(){
        this.showPopUp = true;
        
    }

    handleChange(event){
        if (event.target.name == "cName") {
            this.cName = event.target.value
            console.log('this.startTime' + this.cName)
        } else if (event.target.name == "comment Text") {
            this.commentText = event.target.value
            console.log('this.commentText' + this.commentText)
    }
}

    hanleSaveComments(){
        saveComments({userStoryId : this.recordId, commentName : this.cName , comments : this.commentText})
        .then(() => {
            console.log('cname' + this.cName)
            console.log('commentText '+ this.commentText)
            console.log('Success')
            this.showPopUp = false;
            this.cName = ' '
            this.commentText = ' '
            setTimeout(() => {
            this.getData();
            console.log('refreshed' + JSON.stringify(this.comments))
        }, 2000);
        })
        .catch(error => {
            this.showPopUp = false;
            console.log('error ' +error)
            console.error(error); 
        });
    }

    closePopUp(){
        this.showPopUp = false;
        this.cName = ' '
        this.commentText = ' '
    }

    showToast(){
        this.dispatchEvent(
            new ShowToastEvent({
                title:'Success',
                message:'Stage updated Successfully',
                variant:'success'
            })
        )
    }
}
function formatDate(inputDate) {
    console.log(inputDate + 'datest')
    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0
    const year = date.getFullYear();
    console.log(`${day}/${month}/${year}` + 'fwf')
    return `${day}/${month}/${year}`;
}