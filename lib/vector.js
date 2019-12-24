class Vector {    
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
	
	static fromAngle(angle)
	{
		return new Vector(Math.cos(angle), Math.sin(angle));
	}
    
    zero()
    {
        this.x = 0;
        this.y = 0;
		
		return this;
    }
    
    clone()
    {
        return new Vector(this.x, this.y);
    }
    
    add(vector)
    {
        this.x += vector.x;
        this.y += vector.y;
        
        return this;
    }
    
    subtract(vector)
    {
        this.x -= vector.x;
        this.y -= vector.y;
        
        return this;
    }
    
    multiply(vector)
    {
        this.x *= vector.x;
        this.y *= vector.y;
        
        return this;
    }
    
    scale(scalar)
    {
        this.x *= scalar;
        this.y *= scalar;
        
        return this;
    }
    
    divide(vector)
    {
        this.x /= vector.x;
        this.y /= vector.y;
        
        return this;
    }
	
	clamp(min, max)
	{
		let lengthSq = this.lengthSqr();
		
		if (lengthSq > max*max)
		{
			this.normalize().scale(max);
			return this;
		}
		
		if (lengthSq < min*min)
		{
			this.normalize().scale(min);
			return this;
		}
		
		return this;
	}
    
    lengthSqr()
    {
        return this.x * this.x + this.y * this.y;
    }
    
    length()
    {
        return Math.sqrt(this.lengthSqr());
    }
    
    static distanceSqr(vector1, vector2) {
        let dx = vector1.x - vector2.x;
        let dy = vector1.y - vector2.y;
        return dx * dx + dy * dy;
    }
    
    static distance(vector1, vector2) {
        return Math.sqrt(Vector.distanceSqr(vector1, vector2));
    }
    
    normalize()
    {
        let length = this.length();
        this.x /= length;
        this.y /= length;
        
        return this;
    }
	
	lerp(vector, amount)
	{
		this.x = this.x * amount + vector.x * (1 - amount);
		this.y = this.y * amount + vector.y * (1 - amount);
		
		return this;
	}
	
	alerp(vector, amount)
	{
		let start = this.angleDeg();
		let end = vector.angleDeg();
		
		let shortest_angle=((((end - start) % 360) + 540) % 360) - 180;
		let theta = start + (shortest_angle * amount);
		
		//console.log("Start: " + start);
		//console.log("End: " + end);
		//console.log("Theta: " + theta);
		
		this.x = Math.cos(theta / 180 * Math.PI);
		this.y = Math.sin(theta / 180 * Math.PI);
		
		return this;
	}
	
	
	
	slerp(vector, amount)
	{
		let origin = this.clone().normalize();
		let target = vector.clone().normalize();
		
		let dot = Vector.dot(origin, target);
		
		if (dot < 0) {
			origin.scale(-1);
			dot = -dot;
		}
		
		let DOT_THRESHOLD = 0.9995;
		if (dot > DOT_THRESHOLD) {
			let toTarget = target.clone().subtract(origin);
			origin.add(toTarget.scale(amount));
			
			this.x = origin.x;
			this.y = origin.y;			
			this.normalize();			
			return this;
		}
		
		// Acos is safe here		
		let theta0 = Math.acos(dot);
		let theta = theta0 * amount;
		
		let sinTheta = Math.sin(theta);
		let sinTheta0 = Math.sin(theta0);
		
		let s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
		let s1 = sinTheta / sinTheta0;
		
		origin.scale(s0).add(target.scale(s1));		
		
		this.x = origin.x;
		this.y = origin.y;
		this.normalize();
		return this;
	}
	
	static dot(vector1, vector2)
	{
		return vector1.x * vector2.x + vector1.y * vector2.y;
	}
	
	static cross(vector1, vector2)
	{
		return vector1.x * vector2.y - vector1.y * vector2.x;
	}
	
	angle()
	{
		var one = new Vector(0, 1);
		var angle180 = Math.atan2(Vector.dot(this, one), Vector.cross(this, one));
		
		if (angle180 < 0)
		{
			angle180 = 2*Math.PI + angle180;
		}
		
		return angle180;
	}
	
	static unitTestAngle()
	{
		assert(new Vector(1, 0).angleDeg() === 0);
		assert(new Vector(0, 1).angleDeg() === 90);
		assert(new Vector(-1, 0).angleDeg() === 180);
		assert(new Vector(0, -1).angleDeg() === 270);
	}
	
	angleDeg()
	{
		return this.angle() / Math.PI * 180;
	}
	
	angleWith(vector)
	{
		return Math.acos( Vector.dot( this.clone().normalize(), vector.clone().normalize() ) );
	}
	
	angleWithDeg(vector)
	{
		return this.angleWith(vector) / Math.PI * 180;
	}
    
    toString()
    {
        return "(" + this.x + ", " + this.y + ")";
    }
}