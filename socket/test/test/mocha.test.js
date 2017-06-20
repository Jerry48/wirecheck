function add(a,b){
	return a+b;
}

//var expect = require('chai').expect;

describe('加法函数的测试', function() {
  it('1 加 1 应该等于 2', function() {
    //expect(add(1, 1)).to.be.equal(2);
	console.log(add(1,2));
  });
});