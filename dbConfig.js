
// mySQL
const mysql = require ( "mysql" );
var connectionMySQL = mysql.createConnection (
    {
        host : "localhost"
        , user : "root"
        , password : ""
        , database : "mvision_db"
        , multipleStatements : true
    }
);
connectionMySQL.connect ( function ( error ) { 
        if ( error ) {
            console.log ( error );
        }else {
            console.log ( "MySQL Connected!" );
        }
    } 
);

module.exports = {
    connectionMySQL
}
