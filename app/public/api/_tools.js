
    function createSimpleBall(props) {
        props = Object.assign(this.simpleProps, props);
        let ball = this.objects.createBall(props);
        ball.addVector("v", { expr: "v", color: 0x00ff, showId: true, showMag: true });
        ball.addVector("v", { expr: "v * m", color: 0x00ff00});
        ball.addVector("v", { expr: "a", color: 0x090933});
        ball.put();
        return ball;
    }

    function createSimpleBallFromGlobalPos(props) {
        props = Object.assign(this.simpleProps, props);
        let ball = this.OI.createBallFromGlobalPos(props);
        ball.addVector("v", { expr: "a", color: 0x090933});
        ball.addVector("v", { expr: "v", color: 0x00ff00});
        ball.put();
        return ball;
    }

    function createFixedBox(thickness=0.1, w=2, h=2, pos={x:0, y:0}) {
        // right wall
        let rightWall = this.objects.createRect({
            pos: { x: w/2+pos.x, y: h/2+pos.y },
            w: thickness,
            h: h,
            color: 0xfff000,
            mass: 1,
            restitution: 1,
            rigidBody: "fixed",
        });
        // left wall
        let leftWall = this.objects.createRect({
            pos: { x: -(w/2+pos.x), y: h/2+pos.y },
            w: thickness,
            h: h,
            color: 0xfff000,
            mass: 1,
            restitution: 1,
            rigidBody: "fixed",
        });

        // top wall
        let topWall = this.objects.createRect({
            pos: { x: pos.x, y: h+pos.y },
            w: w,
            h: thickness,
            color: 0xfff000,
            mass: 1,
            restitution: 1,
            rigidBody: "fixed",
        });

        // bottom wall
        let bottomWall = this.objects.createRect({
            pos: { x: pos.x, y: pos.y },
            w: w,
            h: thickness,
            color: 0xfff000,
            mass: 1,
            restitution: 1,
            rigidBody: "fixed",
        });
        rightWall.put();
        leftWall.put();
        topWall.put();
        bottomWall.put();
    }