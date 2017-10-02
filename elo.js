function toEloSpace(rating) {
    return Math.pow(10, rating / 400);
}

function getProbabilities(ratings) {
    var eloSpaceRatings = ratings.map(toEloSpace);
    var eloSpaceRatingsSum = eloSpaceRatings.reduce((x, y) => x + y);
    return eloSpaceRatings.map(x => x / eloSpaceRatingsSum)
}

function safeSumRounding(ratings) {
    var newRatings = ratings.slice();
    
    var roundedCount = 0;
    var rounded = {};
    
    var balance = 0;
    while (roundedCount != newRatings.length) {
        var notRoundedRatings = newRatings
            .map((_, i) => i)
            .filter(i => !rounded[i]);
        balance /= newRatings.length - roundedCount;
        notRoundedRatings.forEach(i => { newRatings[i] += balance; });
        balance = 0;
        
        var valueToRound = newRatings
            .map((x, i) => [
                newRatings.length - notRoundedRatings.map(j => newRatings[j]).filter(y => x === y).length, 
                Math.abs(x - Math.round(x)),
                x
            ])
            .filter((x, i) => !rounded[i])
            .sort()
            .map(x => x[2])[0];
            
        var indicesToRound = newRatings
            .map((x, i) => [x, i])
            .filter((x, i) => !rounded[i])
            .filter(x => valueToRound === x[0])
            .map(x => x[1]);
        
        for (var n = 0; n < indicesToRound.length; ++n) {
            var indiceToRound = indicesToRound[n];
            
            var rating = newRatings[indiceToRound];
            var roundedRating = Math.round(rating);
            balance += rating - roundedRating;
            newRatings[indiceToRound] = roundedRating;
            rounded[indiceToRound] = true;
            ++roundedCount;
        }
    }
    
    return newRatings;
}

function getNewEloRatings(ratings, k, rounding) {
    k = k || 32;
    rounding = rounding === undefined;
    
    var probabilities = getProbabilities(ratings);
    var newEloRatings = [];
    
    for (var i = 0; i < ratings.length; ++i) {
        var actualResult = i == 0 ? 1 : 0;
        var change = k * (actualResult - probabilities[i]);
        newEloRatings[i] = ratings[i] + change;
    }
    
    if (rounding) {
        newEloRatings = safeSumRounding(newEloRatings);
    }
    
    return newEloRatings;
}

function getNewEloRatingsRelative(ratings, k, rounding) {
    k = k || 32;
    rounding = rounding === undefined;
    var newEloRatings = ratings.slice();
    
    for (var i = 0; i < newEloRatings.length - 1; ++i) {
        var ratingsToUpdate = newEloRatings.slice(i);
        var winningProbability = getProbabilities(ratingsToUpdate)[0];
        ratingsToUpdate = getNewEloRatings(ratingsToUpdate, k, false);
        for (var j = i; j < newEloRatings.length; ++j) {
            newEloRatings[j] = ratingsToUpdate[j - i];
        }
        k = k * winningProbability;
    }
    
    if (rounding) {
        newEloRatings = safeSumRounding(newEloRatings);
    }
    
    return newEloRatings;
}