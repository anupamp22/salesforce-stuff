/*
* Author: Chia Chang
* Developer: Chia Chang
* Copyright: Author for details.
* Title: JS Library for Order-2-Cash (NetSuite)
* Description:
* Implementing the Restful API from NetSuite Side.
* To read ths javascript library you need to understand the late-binding-relate techniques and
* static members usage across the application Cycle. 
* Creative is the key to the real engineering world.
* Thinking javascript is just nothing?! Well, you better think it again.
* Ref#: 3.1, MIT version.
* Licensing: Mitchell International. GPL is available in Git format via SVN. Ask Chia for details.
* Open Issues (remove when resolved): N/A
* Usage: NetSuite SuiteScript RESTlet API. Invoke internally.
* API Version: 
* Revisions' History:
* 03.05.13. Application created for integration purpose. (Chia, CRM Team)
* 04.15.13. Add SO insert, update
* 04.17.13. Implementing the is_netsute_text_value__c from SF
* 04.25.13. Adding custcol_mi_contract_line_nbr in the SO line item
* 06.03.13. Adding functionalities for updating record in SF
* 06.04.13. Adding get SO details by the SFDC Id
*/

/* Chia's utility library- Validation only */
var app = {envs:[],
	version:'1.4.17a',
	projectName:'Order-2-Cash',
	developerEmails:['chia.chang@mitchell.com'],
	adminEmails:['chia.chang@mitchell.com','julie.hallstrum@mitchell.com'],
	email:'',
	emailProcessing:
	/* Sending corresponding emails*/
	function()
	{
		var entries = new Object();
		entriess['transaction'] = '1000';

		var emailBody = nlapiMergeRecord( 25, 'salesorder', '100' ).getValue();
		nlapiSendEmail( -5, app.developerEmails[0], 'Sales Order Notification',
		emailBody , null, null, entries );
	},
	salesOrder:{
		evenHandling:{
			afterSubmit:
			function(type,form){
				var newId = nlapiGetRecordId();
				var newType = nlapiGetRecordType();
				var entry = nlapiLoadRecord(soObj.recordtype,newId);
				/*
				function replacer(key, value) {
				if (typeof value === 'number' && !isFinite(value)) {
				return String(value);
				}
				return value;
				}

				var url = 'https://cs17.salesforce.com/services/oauth2/token';
				var custUrl = 'https://cs17.salesforce.com/services/apexrest/O2C_REST/';

				var reqContent = new Array();

				reqContent['grant_type']='password';
				reqContent['username']='chia.chang@mitchell.com.test';

				reqContent['password']='covenant2001OALzsv9tip10lCR0lX6r3sv24';
				reqContent['client_id']='3MVG9ahGHqp.k2_xsl1UF.froNMe_mS25RsTEdYaJYtUbn7FUrCvLDsAwnX7p3_xEbK2pZQ11SfgeDTe.RktX';
				reqContent['client_secret']='2853445991784964352';

				var response = nlapiRequestURL( url, reqContent,null );

				var body=JSON.parse(response.body);
				var myJSONObj = {"sob":{"internalId":"test","tranId":"test1","sfdcId":"test2"}};
				var myJSONText = JSON.stringify(myJSONObj);

				var myHeaderJSONObj = {"Authorization":"OAuth " + body.access_token, "Content-Type":"application/json"};

				var custRes = nlapiRequestURL(custUrl,myJSONText,myHeaderJSONObj);
				nlapiLogExecution('DEBUG','Attr: custRes.Code, Attr Value: ' + custRes.Code);
				nlapiLogExecution('DEBUG','Attr: custRes.body, Attr Value: ' + custRes.body);

				*/
				
			}
		},
		get:
		function(entryObj){
			
			var filters = new Array();
			if (entryObj['internalid']!=null)
				filters[0] = new nlobjSearchFilter( 'internalid', null, 'is', entryObj['internalid']);
			
			if (entryObj['tranid']!=null)
				filters[0] = new nlobjSearchFilter( 'tranid', null, 'is', entryObj['tranid']);
			
			if (entryObj['custbody_sf_so_id']!=null)
				filters[0] = new nlobjSearchFilter( 'custbody_sf_so_id', null, 'is', entryObj['custbody_sf_so_id']);
			
			var columns = new Array();
			columns[0] = new nlobjSearchColumn( 'internalid' );
			var searchresults = nlapiSearchRecord( 'salesorder', null, filters,columns );
			if (searchresults!=null){
				nlapiLogExecution('DEBUG','Attr: searchresults[0].id, Attr Value: ' + searchresults[0].id);
				return nlapiLoadRecord('salesorder',searchresults[0].id);
			}	
			return null;
			
		},
		/*
		if (subFieldKey.toLowerCase()=='custcol_mi_sf_pricebook_id'){
			//nsObj.nlapiSetCurrentLineItemText
			//nlapiLogExecution('DEBUG','billingschedule is updated.');
			nsObj.setCurrentLineItemText(attrName,subFieldKey, subValue);
		}
		else if (subFieldKey.toLowerCase()=='billingshedule'){
			//nsObj.nlapiSetCurrentLineItemText
			//nlapiLogExecution('DEBUG','billingschedule is updated.');
			nsObj.setCurrentLineItemText(attrName,subFieldKey, subValue);
		}
		else{
		
		// Define search filters
		var filters = new Array();
		filters[0] = new nlobjSearchFilter( 'custentity_mi_internal_employee_id', null, 'is', '101534' );
		var columns = new Array();
		columns[0] = new nlobjSearchColumn( 'entityid' );
		var searchresults = nlapiSearchRecord( 'employee', null, filters, columns );
		
		// get the value of the Email column
		var val = searchresults[0].getValue(columns[0]);
		var op=val;
		*/
		
		update:{
			/* Update a Sales Order from SFDC, please do NOT modify the function name */
			entry:
			function(soObj)
			{
				var err = new Object();
				soObj=soObj.productList;
				if (!soObj.recordtype)
				{
					err.status = "Missing recordtype";
					err.message= "Oops..please provide the record Type!";
					return err;
				}

				//This's the standard SuiteScript API //
				var entry = nlapiLoadRecord(soObj.recordtype,soObj['id']);
				
				//Looping through every single field provided by the SFDC Cloud
				for (var fieldKey in soObj)
				{
					if (soObj.hasOwnProperty(fieldKey))
					{
						/* Again remember the recordType is needed! */
						if (fieldKey != 'recordtype')
						{
							var value = soObj[fieldKey];
							if (value && typeof value == 'object'){
								
								if (value['textvalue']!=null){
									entry.setFieldText(fieldKey, value['textvalue']);
									continue;
								}
								if (value['externalid']!=null){
									continue;
								}
								
								switch(fieldKey){
									case 'item':
										app.salesOrder.update.lineItemEntries(fieldKey.toLowerCase(),value,entry);
										break;
									default:
										break;
								}
							}
							else{
								entry.setFieldValue(fieldKey, value);
								nlapiLogExecution('DEBUG','Attr: '+fieldKey,'Attr Value: ' + value);
								
							}
						}
					}
				}
				var entryId = nlapiSubmitRecord(entry,false,true);

				var hresult = nlapiLoadRecord(soObj.recordtype,entryId);
				nlapiLogExecution('DEBUG','NetSuite Internal Id: '+entryId,'SFDC Obj has been successfully extracted');
				return hresult;
			},
			lineItemEntries:
			function(attrName,jsonObj,nsObj){
				for (var i=0;i<jsonObj.length;i++){
					
					for (var subFieldKey in jsonObj[i]){
						if (jsonObj[i][subFieldKey]['textvalue']!=null){
							nsObj.setLineItemText(attrName,subFieldKey.toLowerCase(), i+1, jsonObj[i][subFieldKey]['textvalue']);
							continue;
						}
						if (jsonObj[i][subFieldKey]['externalid']!=null){
							continue;
						}
						switch(subFieldKey){
							case 'isclosed':
								if (jsonObj[i][subFieldKey]=='T'){
									nlapiLogExecution('DEBUG','jsonObj[i][subFieldKey]: '+jsonObj[i][subFieldKey],'jsonObj[i][\'custcol_mi_contract_line_nbr\']: '+jsonObj[i]['custcol_mi_contract_line_nbr']);
									
									var lcount=nsObj.getLineItemCount(attrName);
									nlapiLogExecution('DEBUG','lcount: '+lcount,'lcount details.');
									
									for (var j=1;j<=lcount;j++){
										
										//custcol_sf_so_product_id => custcol_mi_contract_line_nbr
										var pVal=nsObj.getLineItemValue(attrName, 'custcol_mi_contract_line_nbr', j);
										nlapiLogExecution('DEBUG','pVal: '+pVal,'pVal details.');
										nlapiLogExecution('DEBUG','jsonObj[i][\'custcol_mi_contract_line_nbr\']: '+jsonObj[i]['custcol_mi_contract_line_nbr'],'jsonObj[i][\'custcol_mi_contract_line_nbr\'] details.');
										if (pVal==jsonObj[i]['custcol_mi_contract_line_nbr']){
											nlapiLogExecution('DEBUG','System tried to update the isclosed to '+jsonObj[i][subFieldKey],'isclosed updated.');
											nsObj.setLineItemValue(attrName, subFieldKey, j, jsonObj[i][subFieldKey]);
											break;
										}
									}
								}
								break;
								
							default:
								break;
						}
						
					}
					
				}
				//nsObj.commitLineItem(attrName);
				
				
			}
		
		},
		remove:
		function(soObj){
			
		},
		insert:{
			/* Create a Sales Order from SFDC, please do NOT modify the function name */
			entry:
			function(soObj)
			{
				var err = new Object();
				soObj=soObj.productList;
				if (!soObj.recordtype)
				{
					err.status = "Missing recordtype";
					err.message= "Oops..please provide the record Type!";
					return err;
				}

				/* This's the standard SuiteScript API */
				var entry = nlapiCreateRecord(soObj.recordtype);

				/* Looping through every single field provided by the SFDC Cloud */
				for (var fieldKey in soObj)
				{
					if (soObj.hasOwnProperty(fieldKey))
					{
						/* Again remember the recordType is needed! */
						if (fieldKey != 'recordtype' && fieldKey != 'id')
						{
							var value = soObj[fieldKey];
							if (value && typeof value == 'object'){
								if (value['textvalue']!=null){
									entry.setFieldText(fieldKey, value['textvalue']);
									continue;
								}
								if (value['externalid']!=null){
									continue;
								}
								app.salesOrder.insert.lineItemEntries(fieldKey.toLowerCase(),value,entry);
							}
							else{
								entry.setFieldValue(fieldKey, value);
								nlapiLogExecution('DEBUG','Attr: '+fieldKey,'Attr Value: ' + value);
								
							}
						}
					}
				}
				var entryId = nlapiSubmitRecord(entry);

				var hresult = nlapiLoadRecord(soObj.recordtype,entryId);
				nlapiLogExecution('DEBUG','NetSuite Internal Id: '+entryId,'SFDC Obj has been successfully extracted');
				return hresult;
			},
			lineItemEntries:
			function(attrName,jsonObj,nsObj){
				for (var i=0;i<jsonObj.length;i++){
					nsObj.selectNewLineItem(attrName);
					for (var subFieldKey in jsonObj[i]){
						if (jsonObj[i].hasOwnProperty(subFieldKey))
						{
							var subValue=jsonObj[i][subFieldKey];
							if (subValue && typeof subValue == 'object'){
								if (subValue['textvalue']!=null){
									nsObj.setCurrentLineItemText(attrName,subFieldKey.toLowerCase(), subValue['textvalue']);
									continue;
								}
								if (value['externalid']!=null){
									continue;
								}
								app.salesOrder.insert.lineItemEntries(subFieldKey,subValue,nsObj);
							}
							else{
								nsObj.setCurrentLineItemValue(attrName,subFieldKey.toLowerCase(), subValue);									
									
								nlapiLogExecution('DEBUG','Attr: '+subFieldKey,'Attr Value: ' + subValue + ' -- get val' + nsObj.getCurrentLineItemValue(attrName,subFieldKey));	
							
							}
						}
					}
					nsObj.commitLineItem(attrName);
				}
			}

		}
	}
}