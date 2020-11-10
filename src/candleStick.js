    /**
     * Splice for x axis label
     */

    let startDataToSlice = 0
    let nextDataToSlice = 150
    const numsOfDataToSlice = 150

    //initial data slice
    let data = asset.slice(0,150).sort(function(a, b) {
        return a.u - b.u;
    });


    /**
     * @ToolTip
     */

    var tooltip = d3.select("#tooltip")
        .append('text')
        .text('')
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "#000")
        .style('color', 'white')
        .style('width', '174px')

    
    /**
     * @Container
     */
    const Container = d3.select('#container')
        .style('width', '100%')
        .style('height', '868px')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('justify-content', 'center')


    /**
    * @Header
    */
    const Header = Container.select('#title')
        .classed('title_container', true)
        .append('p')
        .text(`O: 0.0 , H: 0.0, L: 0.0, C: 0.0`)
    const SubHeader = Container.select('#title')
        .classed('title_container', true)
        .append('p')
        .text('V: 0')

    const ChartName = Container.select('#header')
        .style('color', '#000')
        .style('display', 'flex')
        .style('margin', 0)
        .style('align-items', 'center')
    const ChartNameTitle = ChartName
        .append('h3')
        .text('CandleStick Chart')
    
    
    function headerButton(){
        
        const PrevData = ChartName
            .append('button')
            .text('Previous Period')
            .style('margin-left', '30px')
            .property('disabled', startDataToSlice < 1)
            .on('click', function(){
                if(startDataToSlice > 1){
                    startDataToSlice -= numsOfDataToSlice
                    nextDataToSlice -= numsOfDataToSlice
                    data = asset.slice(startDataToSlice, nextDataToSlice).sort(function(a,b){
                        return a.u-b.u
                    })
                    d3.select('#candle').selectAll('g').remove()
                    d3.select('#header').selectAll('button').remove()
                    headerButton()
                    render()
                }else{
                    alert('This is the first slice')
                }
            })

        const NextData = ChartName 
            .append('button')
            .text('Next Period')
            .style('margin-left', '30px')
            .property('disabled', startDataToSlice >= asset.length)
            .on('click', function(){
                if(startDataToSlice < asset.length){
                    startDataToSlice += numsOfDataToSlice
                    nextDataToSlice += numsOfDataToSlice
                    data = asset.slice(startDataToSlice, nextDataToSlice).sort(function(a,b){
                        return a.u - b.u
                    })
                    d3.select('#candle').selectAll('g').remove()
                    d3.select('#header').selectAll('button').remove()
                    headerButton()
                    render()
                }else{
                    alert('No more data')
                }
            })
    }
    //initial button render
    headerButton()
   
        



/**
 * @Content
 */
function render(){
    const MARGIN = 2

    //Get data domain
    const getDomain = (rows) => {
        const value = rows.map(({h,l}) => [h, l]).flat()
        return [Math.min(...value), Math.max(...value)]
    }

    const getTimeStampDomain = (rows) => {
        const value = rows.map(({u}) => [u]).flat()
        return [Math.min(...value), Math.max(...value)]
    }

    const getVolumnDomain = (rows) => {
        const value = rows.map(({v}) => [v]).flat()
        return [Math.min(...value), Math.max(...value)]
    }

    const domain = getDomain(data)
    const timeStamp = getTimeStampDomain(data)
    const volumnDomain = getVolumnDomain(data)

    //var for height and width
    const sizeX = window.innerWidth - 50 * MARGIN
    const sizeY = 738 - 40
    const width = sizeX / data.length

    // create scale
    const scaleY = d3.scaleLinear().domain(domain).range([sizeY,0])
    const scaleX = d3.scaleLinear().domain([0, Math.max(...domain) - Math.min(...domain)]).range([0, sizeY])

    const Xlabel = d3.scaleLinear().domain(timeStamp).range([0,sizeX])

        const Candle = Container.select('#candle')
        .attr('height', sizeY + 40) 
        .attr('width', sizeX + 50 * MARGIN)

        /**
         * @Label
         */
        const LabelX = Candle.append('g')
            .call(d3.axisBottom(Xlabel).tickSizeOuter(0).ticks(5))
            .attr('transform', `translate(-${sizeX},${sizeY})`)
            .attr('color', '#000')
            .transition()
            .duration(1000)
            .attr('transform', `translate(0,${sizeY})`)
           


        const LabelY = Candle.append('g')
            .call(d3.axisRight(scaleY).tickSizeOuter(0).ticks(5))
            .attr('transform', `translate(${sizeX},-${sizeY})`)
            .attr('color', '#000')
            .transition()
            .duration(1000)
            .attr('transform', `translate(${sizeX}, 0)`)
            

        /**
         * @MainChart
         */

        const Line = Candle
            .append('g')
            .selectAll('.candleStickLine')
            .data(data)
            .enter()
            .append('line')
            .attr('transform', `translate(0, -${sizeY})`)
            .attr('stroke', (data) => data.c > data.o ? "#4AFA9A" : "#E33F64")
            .attr('stroke-width', 1)
            .attr('x1', (data, index) => index * width + width / 2)
            .attr('y1', data => scaleY(data.l))
            .attr('x2', (data, index) => index * width + width / 2)
            .attr('y2', data => scaleY(data.h))
            .transition()
            .delay((d,i) => 5 * i)
            .duration(1000)
            .attr('transform', `translate(0,0)`)

        
        const transparentVerticalLine = Candle
            .append('g')
            .selectAll('.candleStick')
            .data(data)
            .enter()
            .append('line')
            .attr('stroke', '#000')
            .attr('stroke-opacity', 0.1)
            .attr('stroke-dasharray', '10,1')
            .attr('stroke-width', 1)
            .attr('x1', (data, index) => index * width + width / 2)
            .attr('y1', sizeY)
            .attr('x2', (data, index) => index * width + width / 2)
            .attr('y2', 0)


        const Bar = Candle
            .append('g')
            .selectAll('.candleBar')
            .data(data)
            .enter()
            .append('rect')
            .attr('transform', `translate(0, ${sizeY + 40})`)
            .attr('x', (data, index) => index * width + MARGIN)
            .attr('y', (data) => scaleY(Math.max(data.o, data.c)))
            .attr('width', width - MARGIN * 2)
            .attr('height', (data) => scaleX(Math.max(data.o, data.c) - Math.min(data.o,data.c)))
            .attr('fill', (data) => data.c > data.o ? "#4AFA9A" : "#E33F64")
            .transition()
            .delay((d,i) => 5 * i)
            .duration(1000)
            .attr('transform', `translate(0,0)`)
           
        const transparentBar = Candle
            .append('g')
            .selectAll('.candleBar')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', (data, index) => index * width + MARGIN)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', sizeY)
            .attr('fill-opacity', 0)
            .on('mouseover',  (d,i) => {
                Header.text(`O: ${i.o}, H: ${i.h}, L: ${i.l}, C: ${i.c}`).style('color', `${i.c > i.o ? "#3DB98E" : "#E33F64"}`)
                SubHeader.text(`V: ${i.v}`).style('color', `${i.v > (volumnDomain[0] + volumnDomain[1])/2 ? "#3DB98E" : "#E33F64"}`)
            })


            /**
             * @FOCUS
             */
            const focus = Candle.append('g')
                .attr('class','focus')
                .style('display','none')
            
            focus.append('circle')
                .attr('r', 4.5)

            focus.append('line')
                .classed('x', true)

            focus.append('line')
                .classed('y', true)

            Candle
                .attr('class', 'overlay')
                .on('mouseover', function(){
                    focus.style("display", null); 
                })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", function(e, i){
                    const x0 = Xlabel.invert(d3.pointer(e)[0])
                    const y0 = scaleY.invert(d3.pointer(e)[1])
                    tooltip.style("visibility", "visible")
                        .text(`${y0}`)
                        .style("top",(window.event.pageY-10)+"px")
                        .style("left",  sizeX - 164+ "px")
                    focus.attr("transform", "translate(" + Xlabel(x0) + "," + scaleY(y0) + ")");
                    focus.select("line.x")
                        .attr("x1", -Xlabel(x0))
                        .attr("x2", sizeX - Xlabel(x0))
                        .attr("y1", 0)
                        .attr("y2", 0)
                    focus.select("line.y")
                        .attr("x1", 0)
                        .attr("x2", 0)
                        .attr("y1", -d3.pointer(e)[1])
                        .attr("y2", sizeY - d3.pointer(e)[1])
                });
    }

    /**
     * @InitialRender
     */

    render()