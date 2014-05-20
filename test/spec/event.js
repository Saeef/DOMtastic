describe('events', function() {

    var spy;

    beforeEach(function() {
        spy = sinon.spy();
    });

    describe('on', function() {

        it('should attach an event handler to an element', function() {
            var element = $(document.body);
            element.on('click', spy);
            element.trigger('click');
            expect(spy).to.have.been.called;
        });

        it('should attach event handlers to multiple elements', function() {
            var elements = $('#testFragment li');
            elements.on('click', spy);
            elements.trigger('click');
            expect(spy.callCount).to.equal(5);
        });

        it('should attach an event handler of any type to an element', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.on(eventType, spy);
            element.trigger(eventType);
            expect(spy).to.have.been.called;
        });

        it('should attach an event handler with a namespaced type to an element', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.on(eventType, spy);
            element.trigger(eventType);
            expect(spy).to.have.been.called;
        });

        it('should have the correct `event.target` and `event.currentTarget`', function() {
            var element = $('.fourth'),
                eventTarget,
                eventCurrentTarget,
                eventType = getRndStr();
            $(document.body).delegate('li', eventType, function(event) {
                eventTarget = event.target;
                eventCurrentTarget = event.currentTarget;
            });
            element.trigger(eventType);
            expect(eventTarget).to.equal(element[0]);
            expect(eventCurrentTarget).to.equal(document.body);
        });

    });


    describe('cancellation', function() {

        it('should stop propagation', function() {

            var parent = $('#testFragment'),
                child = $('.fourth'),
                eventType = getRndStr(),
                event = new CustomEvent(eventType, { bubbles: true, cancelable: true, detail: undefined }),
                eventSpy = sinon.spy(event, 'stopPropagation');

            parent.on(eventType, spy);
            child.on(eventType, function(evt){
                evt.stopPropagation();
            });

            child[0].dispatchEvent(event);

            expect(eventSpy).to.have.been.called;
            expect(spy).not.to.have.been.called;

        });

        it('should prevent default', function() {

            var parent = $('#testFragment'),
                child = $('.fourth'),
                eventType = getRndStr(),
                event = new CustomEvent(eventType, { bubbles: true, cancelable: true, detail: undefined }),
                eventSpy = sinon.spy(event, 'preventDefault');

            parent.on(eventType, spy);
            child.on(eventType, function(event){
                event.preventDefault();
            });

            child[0].dispatchEvent(event);

            expect(eventSpy).to.have.been.called;
            expect(spy).to.have.been.called;

        });

    });


     describe('bubbling', function() {

        it('should receive events bubbling up to an element', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.on(eventType, spy);
            $('.two').trigger(eventType);
            expect(spy).to.have.been.called;
        });

        it('should receive events bubbling up to an element not in the DOM', function() {
            var element = $('<div><p></p></div>'),
                child = $(element[0].querySelector('p')),
                eventType = getRndStr();
            element.on(eventType, spy);
            child.trigger(eventType);
            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledOnce;
        });

        it('should receive delegated events bubbling up to an element not in the DOM', function() {
            var element = $('<div><p></p></div>'),
                child = $(element[0].querySelector('p')),
                eventType = getRndStr();
            element.on(eventType, 'p', spy);
            child.trigger(eventType);
            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledOnce;
        });

        it('should not receive events bubbling up to an element when `bubbles` is set to false', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.on(eventType, spy);
            $('.two').trigger(eventType, {bubbles: false});
            expect(spy).not.to.have.been.called;
        });

    });

    describe('off', function() {

        it('should detach an event handler from an element', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.on(eventType, spy);
            element.off(eventType, spy);
            element.trigger(eventType);
            expect(spy).not.to.have.been.called;
        });

        it('should detach an event handler with a namespace from an element', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.on(eventType, spy);
            element.off(eventType);
            element.trigger(eventType);
            expect(spy).not.to.have.been.called;
        });

        it('should detach all event handlers from an element', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.on(eventType, spy);
            element.on(eventType, spy);
            element.off();
            element.trigger(eventType);
            expect(spy).not.to.have.been.called;
        });

        it('should detach event handlers from multiple elements', function() {
            var elements = $('#testFragment li'),
                eventType = getRndStr();
            elements.on(eventType, spy);
            elements.off(eventType, spy);
            elements.trigger(eventType);
            expect(spy).not.to.have.been.called;
        });

        it('should not throw for elements without event handlers', function() {
            var elements = $('#testEmpty'),
                eventType = getRndStr();
            expect(function() {
                elements.off(eventType, function(){});
            }).to.not.throw();
        });

    });

     describe('delegate', function() {

        it('should receive a delegated event from a child element', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.delegate('li', eventType, spy);
            $('.fourth').trigger(eventType);
            expect(spy).to.have.been.called;
        });

        it('should receive a delegated event in detached nodes', function() {
            var element = $('<div><span></span></div>'),
                eventType = getRndStr();
            element.delegate('span', eventType, spy);
            element.find('span').trigger(eventType);
            expect(spy).to.have.been.called;
        });

        it('should receive delegated events from multiple child elements', function() {
            var elements = $('#testFragment li'),
                eventType = getRndStr();
            elements.delegate('span', eventType, spy);
            $('#testFragment li span').trigger(eventType);
            expect(spy.callCount).to.have.equal(5);
        });

        it('should receive delegated events from child elements', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.delegate('li', eventType, spy);
            $('.two').trigger(eventType);
            $('.three').trigger(eventType);
            $('.fourth').trigger(eventType);
            expect(spy).to.have.been.calledThrice;
        });

        it('should forward request to `delegate` if that signature was used', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.on(eventType, 'li', spy);
            $('.fourth').trigger(eventType);
            expect(spy).to.have.been.called;
        });

    });

     describe('undelegate', function() {

        it('should detach a delegated event handler from an element', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.delegate('li', eventType, spy);
            element.undelegate('li', eventType, spy);
            $('.fourth').trigger('testEvent2');
            expect(spy).not.to.have.been.called;
        });

        it('should detach a delegated event handler from multiple elements', function() {
            var elements = $('#testFragment li'),
                eventType = getRndStr();
            elements.delegate('li', eventType, spy);
            elements.undelegate('li', eventType, spy);
            $('.fourth').trigger('testEvent21');
            expect(spy).not.to.have.been.called;
        });

        it('should remove all delegated handlers when un-delegating event handlers', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.delegate('li', eventType, spy);
            element.delegate('li', eventType, spy);
            element.delegate('li', eventType, spy);
            element.undelegate('li', eventType, spy);
            $('.two').trigger(eventType);
            expect(spy).not.to.have.been.called;
        });

        it('should forward request to `undelegate` if that signature was used', function() {
            var element = $(document.body),
                eventType = getRndStr();
            element.on(eventType, 'li', spy);
            element.off(eventType, 'li', spy);
            $('.fourth').trigger(eventType);
            expect(spy).not.to.have.been.called;
        });

    });

    describe('trigger', function() {

        it('should execute handler for detached nodes', function() {
            var element = $('<div></div>'),
                eventType = getRndStr();
            element.on(eventType, spy);
            element.trigger(eventType);
            expect(spy).to.have.been.called;
        });

    });

    describe('fluent', function() {

        it('should provide a chainable API', function() {
            var expected = $(document.body);
            var actual = expected.on('').off().delegate('', '').undelegate();
            expect(actual).to.be.equal(expected);
        });

    });

});
