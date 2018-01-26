//ADMIN Authorization
var island = "";


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
    //SELECT YOUR ISLAND
    $('#islandPicker').on('change', function() {
        option = $(this).val();
        
        //clear any existing data
        $('#nodeList tbody').empty();
        $('.add-node').show();
        getNodes(option);
    })
    
    
    var currentNode = "";
    
    function getNodes(i) {
        island = i;
                
        $.ajax({
            url : 'https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/nodes?island=' + island,
            method: 'GET',
            dataType : 'json'
        }).done(function(data) {
            
            if(data.nodes.length < 1 || data.nodes.length == 0) {
                $('#nodeList tbody').append('<tr><td colspan="4"><strong class="orange">There are no nodes associated with this island.</strong></td></tr>');
                return;
            } else {
                listNodes(data);
            }
        })
    }
    
    function listNodes(data) {
        var nodes = data.nodes;
        
        for(var i = 0; i < nodes.length; i++) {
            
            var nodeId = nodes[i].node_id;
            var nodeStatus = nodes[i].status;
            var nodeNotes = nodes[i].notes;
            
            var tableRow;
            tableRow = '<tr class="node-row" data-node-id="' + nodeId + '"><td>';
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
        
                var id = $(this).data("node");
                
                for(var i=0; i < nodes.length; i++) {
                    if( nodes[i].node_id == id ) {
                        currentNode = nodes[i];
                    }
                }
                
                $('#nodeLabel').text("Editing Node " + currentNode.node_id);
                $('#nodeInfoUpdate').val(currentNode.notes);
                //open the modal
                $('#nodeModal').modal();

                return false;

            });
        }
    }
    
    $('#newNodeBtn').on('click', function() {
        $('#nodeModalAdd').modal('toggle');
        
    })
    
    $('#addNode').on('click', function() { 
       //format the data
        
        
        var nodeData = {
            island : island,
            node_id : $('#nodeIdInput').val(),
            notes : $('#nodeInfoUpdate2').val(),
            status : $('#nodeStatusSelect2').val(),
        }
        
        if ( nodeData.notes.length == 0 ) {
            alert("Please add a comment to the notes section.");
            return;
        }
        
        //submit the data
        
        $.ajax({
            url : 'https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/nodes',
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
                $('#nodeModalAdd').modal('hide');
                //empty the list and re-pull the updated data
                $('#nodeList tbody').empty();
                //empty the text field
                $('#nodeInfoUpdate').val('');
                getNodes( $('#islandPicker').val() );
            }
        });
        
    });
    
    
    
    $('#updateNode').on('click', function() { 
       //format the data
        
        
        var nodeData = {
            island : island,
            node_id : currentNode.node_id,
            notes : $('#nodeInfoUpdate').val(),
            status : $('#nodeStatusSelect').val(),
        }
        
        if ( nodeData.notes.length == 0 ) {
            nodeData.notes = currentNode.notes;
        }
        
        //console.log(nodeData);
        
        $.ajax({
            url : 'https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/nodes',
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
                //empty the text field
                $('#nodeInfoUpdate').val('');
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

    
    
    //ADD ESTATES
    
    $('#addEstate').on('click', function() {
        
        if($('#islandPicker2').val() == "Choose an island"){
            alert("Please select an island.");
            return;
        }
        
        if ( $('#estateNodes').val().length == 0 ) {
            alert("The Nodes field can't be blank");
            return;
        }
        
        var estateNodes = $('#estateNodes').val().split(',');
        
        var estateData = {
            estate_id : idGen(),
            estate_name : $('#estateName').val(),
            estate_area : $('#estateArea').val(),
            nodes : estateNodes,
            island : $('#islandPicker2').val()
        }
        
        //console.log(estateData);
                
        url = "https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/estates/estate";
        
        $.ajax({
            url : url,
            dataType : 'json',
            method : 'POST',
            'headers' : {
                'Authorization' : idToken,
            },
            contentType: 'application/json',
            data : JSON.stringify(estateData),
            success : function(data) {
                alert(data.message); 
                
                $('#estateName').val('');
                $('#estateArea').val('');
                $('#estateNodes').val('');  
                                
            }
        });
        
        
        
    })
    
    $('#nodeFilter').on('change keyup', function() {
        
        var filterVal = $(this).val().toUpperCase();
        
        $(".node-row").each(function(i) {
            var rowId = $(this).data('node-id').toString();
            
            if( rowId.indexOf(filterVal) == -1 ) {
                $(this).hide();
            } else ($(this).show());
        })
        
        
        
    })
    
    function idGen() {
        var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        var uniqid = randLetter + Date.now();
        return uniqid;
    }
    
    
} //end ADMIN PAGE FUNCTION