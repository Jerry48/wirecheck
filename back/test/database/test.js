function func(a,b){
	return function(a,c){
		return a*b;
	}
}

console.log(func(2,3)(4,5));
