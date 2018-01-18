//ADMIN Authorization



AWSCognito.config.region = 'us-east-1';

var authToken;
var idToken;
var poolData = {
            UserPoolId : 'us-east-1_RKFmazI7g', // your user pool id here
            ClientId : '6um5ht9iktfkco8mb0l277bs45' // your app client id here
        };
var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

var currentUser = userPool.getCurrentUser();
//console.log(currentUser);
var firstTimer = "";




if( !localStorage.getItem('viyaAdminFirstTime') ) {
    localStorage.setItem('viyaAdminFirstTime','yes');
}

firstTimer = localStorage.getItem('viyaAdminFirstTime');

//show / hide fields based on if a new uesr has signed in
if( firstTimer == "no" ) {
    $('label#newPwMessage').hide();
    $('#tempPassword').hide();
} else {
    $('label#newPwMessage').show();  
}
if( $('body').data("pagename") == 'admin') {
    
    
    //AWS COGNITO 
    
    $("#loginAuth").on('submit', function() {
    
        var username = $('#adminUser').val();
        var password;
        var newPassword;
        
        switch(firstTimer) {
            case "yes":
                password = $('#tempPassword').val();
                newPassword = $('#adminPassword').val();
                break;
                
            default:
                password = $('#adminPassword').val();
        }
        
        
        //AWS USER DATA
        var userData = {
            Username : username, // your username here
            Pool : userPool
        };
        
        //do Login
        var authenticationData = {
            Username : username, // your username here
            Password : password // your password here
        };
        var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                //console.log('access token + ' + result.getAccessToken().getJwtToken());
                idToken = result.getIdToken().getJwtToken();
                
                
                
                $('#adminLogin').fadeOut(300);
                $('#nodeEditor').show();//show the node editor
                //getNodes();
            },

            onFailure: function(err) {
                alert(err);
            },
            mfaRequired: function(codeDeliveryDetails) {
                var verificationCode = prompt('Please input verification code' ,'');
                cognitoUser.sendMFACode(verificationCode, this);
            },
            newPasswordRequired: function(userAttributes, requiredAttributes) {
                localStorage.setItem('viyaAdminFirstTime','no');
                firstTimer = localStorage.getItem('viyaAdminFirstTime');
                
                var attributesData = {};
                
                cognitoUser.completeNewPasswordChallenge(newPassword, attributesData, this)
            }
        });
       

        return false;
    });
    
    //if a user is logged in...
    if (currentUser != null) {
        currentUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            console.log('session validity: ' + session.isValid());
            $('#adminLogin').hide();
            $('#nodeEditor').show();
            
            idToken = currentUser.getSignInUserSession().getIdToken().getJwtToken();
            //console.log(idToken);
            //getNodes();
            
        });
        
    } else {
        $('#adminLogin').show();
    }

    $('#islandPicker').on('change', function() {
        option = $(this).val();
        
        //clear any existing data
        $('#nodeList tbody').empty();
        
        getNodes(option);
    })
    
    
    var currentNode = "";
    
    function getNodes(island) {
        
        var endpoint = "";
        
        switch(island){
            case "stt":
                endpoint = "stt-nodes"; 
                break;
            default:
                endpoint = "stt"; 
                break;
        }
        
        $.ajax({
            url : 'https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/' + endpoint,
            method: 'GET',
            dataType : 'json'
        }).done(function(data) {
            listNodes(data);
        })
    }
    
    function listNodes(data) {
        var nodes = data.nodes;
        
        for(var i = 0; i < nodes.length; i++) {
            
            var nodeId = nodes[i].node_id;
            var nodeStatus = nodes[i].status;
            var nodeNotes = nodes[i].notes;
            
            var tableRow;
            tableRow = '<tr><td>';
            tableRow += nodeId
            tableRow += '</td><td>';
            tableRow += nodeStatus
            tableRow += '</td><td>';
            tableRow += nodeNotes;
            tableRow += '</td><td>';
            tableRow += '<a href="#" data-node="' + nodeId  +  '" data-status="' + nodeStatus + '" class="editLink btn btn-primary">Edit Node</a>';
            tableRow += '</td></tr>';
            
            $('#nodeList tbody').append(tableRow);
            
            $('body').off('click').on('click', '.editLink', function() {
        
                currentNode = $(this).data("node");
                //console.log(currentNode);
                
                $('#nodeLabel').text("Editing Node " + currentNode);
                
                //open the modal
                $('#nodeModal').modal();

                return false;

            });
        }
    }
    
    
    
    $('#updateNode').on('click', function() { 
       //format the data
        
        var nodeData = {
            "node_id" : currentNode,
            "notes" : $('#nodeInfoUpdate').val(),
            "status" : $('#nodeStatusSelect').val(),
        }
        
        //console.log(nodeData);
        
        $.ajax({
            url : 'https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/stt-nodes',
            dataType : 'json',
            method : 'POST',
            'headers' : {
                'Authorization' : idToken,
            },
            contentType: 'application/json',
            data : JSON.stringify(nodeData),
            success : function(data) {
                alert(data.message); 
                
                //hide the modal
                $('#nodeModal').modal('hide');
                //empty the list and re-pull the updated data
                $('#nodeList tbody').empty();
                getNodes( $('#islandPicker').val() );
            }
        })
        
    })//.END Node Update

    $('#logOutBtn').on('click tap', function() {
  
        if(currentUser != null) {
            currentUser.signOut();
            //show the admin panel
            $('#adminLogin').show();
            //hide the node editor
            $('#nodeEditor').hide();
        }

        return false;
    });

    
    
    
    
} //end ADMIN PAGE FUNCTION