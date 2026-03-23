// ------------------------Section 1------------------------
// --------------------------
// Question #1
// --------------------------
var lat_tropicOfCancer = 23.43588;     //https://en.wikipedia.org/wiki/Tropic_of_Cancer
var lat_tropicOfCapricorn = -23.43588; //https://en.wikipedia.org/wiki/Tropic_of_Capricorn
//Latitude has to be between the tropical lines.
db.shipwrecks.find({ "latdec": {$lte: lat_tropicOfCancer, $gte: lat_tropicOfCapricorn}}).count() //509

// --------------------------
// Question #2
// --------------------------
db.shipwrecks.find({ history: "Plane" }, {chart: 1, depth: 1, history: 1, watlev: 1, coordinates: 1}) //2 Planes

// --------------------------
// Question #3
// --------------------------
db.shipwrecks.find({feature_type:"Wrecks - Visible", watlev:"covers and uncovers",latdec:{$gte:45.0,$lte:60.0}},
    {"Wreck Coordinates":"$coordinates", "Wreck Status": "$feature_type", "Water Level": "$watlev"}) //9 wrecks matching
    
// ------------------------Section 2------------------------
// --------------------------
// Question #4
// --------------------------
db.listingsAndReviews.aggregate([
    {$match:{ "address.suburb": "Bondi Beach", "address.market": "Sydney", bedrooms:{$gte:2}, amenities:{$all:["Kitchen", "Air conditioning"]}}},
    {$count: "Matches found"}
]) //4 matches


// --------------------------
// Question #5
// --------------------------
db.listingsAndReviews.aggregate([
    { $match: { "address.government_area": "Williamsburg", "address.market": "New York" }},
    { $sort: { price: -1 }},
    { $limit: 5 },
    { $project: { _id: 0, "Listing URL": "$listing_url", "Listing name": "$name", "Nightly price": "$price", Neighborhood: "$address.government_area", "Airbnb market": "$address.market" }}
]) //Prices go from $550 to $300

// --------------------------
// Question #6
// --------------------------

db.listingsAndReviews.aggregate([
    { $match: { "address.market": { $in: [ "Oahu", "Kauai", "Maui", "The Big Island" ]}}},
    { $group: { _id: "$address.market", "Number Of Listings": { $sum: 1 }, "Lowest nightly listing price": { $min: "$price" }, "Average nightly listing price": { $avg: "$price" }, "Highest nightly listing price": { $max: "$price" }}},
    { $sort: { "Number Of Listings": -1 }},
    { $project: { _id: 0, "Hawaiian Market": "$_id", "Number Of Listings": "$Number Of Listings", "Lowest nightly listing price": "$Lowest nightly listing price", "Average nightly listing price": { $round: [ "$Average nightly listing price", 2 ]}, "Highest nightly listing price": "$Highest nightly listing price" }}
])//Oahu has the most listings (253), Kauai has the least (67)

// --------------------------
// Question #7
// --------------------------

db.listingsAndReviews.aggregate([
    { $match: { "address.market": { 
        $in: [ "New York", "Istanbul", "Barcelona", "Hong Kong", "Porto", "Sydney" ]}, 
        bedrooms: 1, 
        room_type: "Entire home/apt", 
        amenities: { $all: [ "Wifi", "Kitchen", "Coffee maker" ]}, 
        "review_scores.review_scores_rating": { $gte: 95 }}},
    { $group: { _id: "$address.market", "Number Of Listings": { $sum: 1 }, "Average nightly price": { $avg: "$price" }}},
    { $sort: { "Number Of Listings": -1 }},
    { $project: { _id:0, City: "$_id", "Number Of Listings": "$Number Of Listings", "Average nightly price": {$round: ["$Average nightly price", 2] }}}
])//Porto has the most listings (60, avg $59.27), HK has the least (8, avg $1219.75)

// ------------------------Section 3------------------------
// --------------------------
// Question #8
// --------------------------
db.theaters.aggregate([
    { $group: { _id: "$location.address.state", TotalTheaters: { $sum: 1 }}},
    { $match: { TotalTheaters: { $gte: 20, $lte:30 }}},
    { $sort: { _id: 1 }},
    { $project: { _id:0, State: "$_id", TotalTheaters: "$TotalTheaters" }}
])//First: AZ (26 theaters), Last: WA (27 theaters). 7 states total

// --------------------------
// Question #9
// --------------------------
db.movies.aggregate([
    { $match: { 
        year: { $gte: 2005, $lte: 2015 }, 
        cast: { $in: [ "Nicolas Cage", "Priyanka Chopra", "Emily Blunt", "Christian Bale", "Ryan Reynolds", "Reese Witherspoon", "Anna Kendrick" ]}}},
    {$unwind: "$cast" },
    { $match: { 
        cast: { $in: [ "Nicolas Cage", "Priyanka Chopra", "Emily Blunt", "Christian Bale", "Ryan Reynolds", "Reese Witherspoon", "Anna Kendrick" ]}}},
    { $group: { _id: "$cast", TotalFilms: { $sum: 1 }}},
    {$sort: { TotalFilms: -1 }},
    { $project: { _id:0, Actor: "$_id", TotalFilms: "$TotalFilms" }}
]) //Most appearnaces: Nic Cage (21), least: Anna Kendrick (14)

// --------------------------
// Question #10
// --------------------------
db.movies.aggregate([
    { $match: { year: { $gte: 2000, $lte: 2020 }, genres: "Romance" }},
    {$unwind: "$cast" },
    { $group: { _id: "$cast", NumberOfRomanceFilmsReleased: { $sum: 1 }, AverageIMDBRating: { $avg: "$imdb.rating" }}},
    { $match: { NumberOfRomanceFilmsReleased: { $gte: 10 }}},
    { $sort: { AverageIMDBRating:-1 }},
    { $project: { _id:0, NumberOfRomanceFilmsReleased: "$NumberOfRomanceFilmsReleased", AverageIMDBRating: {$round: ["$AverageIMDBRating", 2]}, Actor: "$_id" }}
])//Highest: Shah Rukh Khan (7.21 IMDB), Lowest: Kate Hudson (6.02 IMDB)
