$(document).ready( function() {
  getFoursquare();
});

function getFoursquare() {
  console.log('in getFoursquare');
  var FOURSQUARE_CLIENT_ID = "RHDWWG2YDEERMJW0YJAD5B43H3CYJ25CKUL5DGCUTZNOJ2DI";
  var FOURSQUARE_CLIENT_SECRET = "CB1QJL4K32E4DGM25550J0OZBDQIHHHD5VR2CSCA5S45PKLW";
  var REDIRECT_URI = "http://rebchenitconsulting.aws.af.cm";
  //var TOKEN = $('#foursquare').attr('data-token');
  var TOKEN = 'TG01TNXK54NMK3KGR1KEH4PPQCK3YOI1OSCVEXXGVUX1Z5QP';
  console.log('token is ' + TOKEN); 
  try{
    $.ajax({
      url: 'https://api.foursquare.com/v2/users/self/checkins?oauth_token=' + TOKEN + '&v=20130506',
      dataType: "jsonp", 
      crossDomain: true,
      success: function(response) {
        var checkins = response.response.checkins;
        console.log(checkins);
        getCheckins(checkins);
      }
    });
    return false;
  } catch (e) {console.log(e.description);}
}

function getCheckins(checkins) {
  console.log('in getCheckins');
  var latest = checkins.items[0];
  console.log(latest);
}
