<template>
    <div class="main-content">
        <el-dialog title="收银" :visible.sync="goodsShouyinDialog">
            <span >
                收银类型:
                <el-select v-model="goodsShouyinTypes" filterable placeholder="请选择支付类型" :disabled="isinfo">
                    <el-option
                            v-for="(item,index) in goodsShouyinTypesOptions"
                            v-bind:key="item.id"
                            :label="item.indexName"
                            :value="item.codeIndex">
                    </el-option>
                </el-select>
            </span>
            <span v-if="!isinfo" >
                商品信息:
                <el-select v-model="goodsId" filterable placeholder="请选择商品" >
                    <el-option
                            v-for="(item,index) in goodsOptions"
                            v-bind:key="item.id"
                            :label="item.goodsName"
                            :value="item.id">
                    </el-option>
                </el-select>
            </span>
            <el-button v-if="!isinfo" @click="addGoodsShouyinData()" type="success" >添加</el-button>

            <el-table :data="goodsShouyinData">
                <el-table-column property="id" label="id" width="40"></el-table-column>
                <el-table-column property="goodsName" label="商品名字" width="200"></el-table-column>
                <el-table-column property="goodsNewMoney" label="商品价格" width="90"></el-table-column>
                <el-table-column property="goodsKucunNumber" label="商品库存" width="90"></el-table-column>
                <el-table-column property="goodsShouyinListNumber" label="购买数量" width="200">
                    <template slot-scope="scope">
                        <el-input-number v-model="scope.row.goodsShouyinListNumber" :min="1" :max="scope.row.goodsKucunNumber" size="mini" :disabled="isinfo"></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column property="totalMoney" label="总价" width="200">
                    <template slot-scope="scope">
                        {{scope.row.goodsNewMoney * scope.row.goodsShouyinListNumber}}
                    </template>
                </el-table-column>
                <el-table-column property="caozuo" label="操作">
                    <template slot-scope="scope">
                        <el-button v-if="!isinfo" @click="deleteGoodsShouyinData(scope.$index)" type="danger">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <h1 style="float: right"  >现总价:<font style="color: red" >{{totalMoney.toFixed(2)}}</font></h1>
            <div slot="footer" class="dialog-footer">
                <el-button @click="goodsShouyinDialog = false">关 闭</el-button>
                <el-button type="primary" @click="submitGoodsShouyinData()" v-if="!isinfo">提 交</el-button>
            </div>
        </el-dialog>
        <!-- 条件查询 -->
        <div v-if="showFlag">
            <el-form :inline="true" :model="searchForm" class="form-content">
                <el-row :gutter="20" class="slt" :style="{justifyContent:contents.searchBoxPosition=='1'?'flex-start':contents.searchBoxPosition=='2'?'center':'flex-end'}">
                 
                     <el-form-item :label="contents.inputTitle == 1 ? '购买流水号' : ''">
                         <el-input prefix-icon="el-icon-search" v-model="searchForm.goodsShouyinUuidNumber" placeholder="购买流水号" clearable></el-input>
                     </el-form-item>
                         
                     <el-form-item :label="contents.inputTitle == 1 ? '支付类型' : ''">
                        <el-select v-model="searchForm.goodsShouyinTypes" placeholder="请选择支付类型">
                            <el-option label="=-请选择-=" value=""></el-option>
                            <el-option
                               v-for="(item,index) in goodsShouyinTypesSelectSearch"
                               v-bind:key="index"
                               :label="item.indexName"
                               :value="item.codeIndex">
                            <!--lable是要展示的名称-->
                            <!--value是值-->
                            </el-option>
                        </el-select>
                     </el-form-item>
                        
                    <el-form-item>
                        <el-button type="success" @click="search()">查询<i class="el-icon-search el-icon--right"/></el-button>
                    </el-form-item>
                </el-row>
                <el-row class="ad" :style="{justifyContent:contents.btnAdAllBoxPosition=='1'?'flex-start':contents.btnAdAllBoxPosition=='2'?'center':'flex-end'}">
                    <el-form-item>
                        <el-button
                                v-if="isAuth('goodsShouyin','删除')"
                                :disabled="dataListSelections.length <= 0"
                                type="danger"
                                icon="el-icon-delete"
                                @click="deleteHandler()"
                        >删除</el-button>
                        &nbsp;
                        <el-button
                                v-if="isAuth('goodsShouyin','报表')"
                                type="success"
                                icon="el-icon-pie-chart"
                                @click="chartDialog()"
                        >报表</el-button>
                        &nbsp;
                        <a style="text-decoration:none" class="el-button el-button--success"
                           v-if="isAuth('goodsShouyin','导入导出')"
                           icon="el-icon-download"
                           href="http://localhost:8080/wurenchaosguanli/upload/goodsShouyinMuBan.xls"
                        >批量导入购买数据模板</a>
                        &nbsp;
                        <el-upload
                                v-if="isAuth('goodsShouyin','导入导出')"
                                style="display: inline-block"
                                action="wurenchaosguanli/file/upload"
                                :on-success="goodsShouyinUploadSuccess"
                                :on-error="goodsShouyinUploadError"
                                :show-file-list = false>
                            <el-button
                                    v-if="isAuth('goodsShouyin','导入导出')"
                                    type="success"
                                    icon="el-icon-upload2"
                            >批量导入购买数据</el-button>
                        </el-upload>
                        &nbsp;
                        <!-- 导出excel -->
                        <download-excel v-if="isAuth('goodsShouyin','导入导出')" style="display: inline-block" class = "export-excel-wrapper" :data = "dataList" :fields = "json_fields" name = "goodsShouyin.xls">
                            <!-- 导出excel -->
                            <el-button
                                    type="success"
                                    icon="el-icon-download"
                            >导出</el-button>
                        </download-excel>
                        &nbsp;
                        <el-button
                                v-if="isAuth('goodsShouyin','新增')"
                                type="success"
                                icon="el-icon-shopping-cart-full"
                                @click="openGoodsShouyinDialog()"
                        >收银</el-button>
                    </el-form-item>
                </el-row>
            </el-form>
            <div class="table-content">
                <el-table class="tables" :size="contents.tableSize" :show-header="contents.tableShowHeader"
                          :header-row-style="headerRowStyle" :header-cell-style="headerCellStyle"
                          :border="contents.tableBorder"
                          :fit="contents.tableFit"
                          :stripe="contents.tableStripe"
                          :row-style="rowStyle"
                          :cell-style="cellStyle"
                          :style="{width: '100%',fontSize:contents.tableContentFontSize,color:contents.tableContentFontColor}"
                          v-if="isAuth('goodsShouyin','查看')"
                          :data="dataList"
                          v-loading="dataListLoading"
                          @selection-change="selectionChangeHandler">
                    <el-table-column  v-if="contents.tableSelection"
                                      type="selection"
                                      header-align="center"
                                      align="center"
                                      width="50">
                    </el-table-column>
                    <el-table-column label="索引" v-if="contents.tableIndex" type="index" width="50" />

                    <el-table-column  :sortable="contents.tableSortable" :align="contents.tableAlign"
                                   prop="goodsShouyinUuidNumber"
                                   header-align="center"
                                   label="购买流水号">
                        <template slot-scope="scope">
                            {{scope.row.goodsShouyinUuidNumber}}
                        </template>
                    </el-table-column>

                    <el-table-column  :sortable="contents.tableSortable" :align="contents.tableAlign"
                                   prop="goodsShouyinTruePrice"
                                   header-align="center"
                                   label="实付金额">
                        <template slot-scope="scope">
                            {{scope.row.goodsShouyinTruePrice}}
                        </template>
                    </el-table-column>
                    <el-table-column  :sortable="contents.tableSortable" :align="contents.tableAlign"
                                      prop="goodsShouyinTypes"
                                      header-align="center"
                                      label="支付类型">
                        <template slot-scope="scope">
                            {{scope.row.goodsShouyinValue}}
                        </template>
                    </el-table-column>

                    <el-table-column  :sortable="contents.tableSortable" :align="contents.tableAlign"
                                   prop="insertTime"
                                   header-align="center"
                                   label="购买时间">
                        <template slot-scope="scope">
                            {{scope.row.insertTime}}
                        </template>
                    </el-table-column>

                    <el-table-column width="300" :align="contents.tableAlign"
                                     header-align="center"
                                     label="操作">
                        <template slot-scope="scope">
                            <el-button v-if="isAuth('goodsShouyin','查看')" type="success" icon="el-icon-tickets" size="mini" @click="addOrUpdateHandler(scope.row.id,'info')">详情</el-button>
                            <el-button v-if="isAuth('goodsShouyin','修改')" type="primary" icon="el-icon-edit" size="mini" @click="addOrUpdateHandler(scope.row.id)">修改</el-button>

                            <el-button v-if="isAuth('goodsShouyin','删除')" type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(scope.row.id)">删除</el-button>
                            <el-button v-if="isAuth('goodsShouyin','查看')" type="primary" icon="el-icon-tickets" size="mini" @click="getId(scope.row.id)">查看列表详情</el-button>

                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination
                        clsss="pages"
                        :layout="layouts"
                        @size-change="sizeChangeHandle"
                        @current-change="currentChangeHandle"
                        :current-page="pageIndex"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="Number(contents.pageEachNum)"
                        :total="totalPage"
                        :small="contents.pageStyle"
                        class="pagination-content"
                        :background="contents.pageBtnBG"
                        :style="{textAlign:contents.pagePosition==1?'left':contents.pagePosition==2?'center':'right'}"
                ></el-pagination>
            </div>
        </div>
        <!-- 添加/修改页面  将父组件的search方法传递给子组件-->
        <add-or-update v-if="addOrUpdateFlag" :parent="this" ref="addOrUpdate"></add-or-update>



        <el-dialog title="统计报表" :visible.sync="chartVisiable" width="800">
            <el-date-picker
                    v-model="echartsDate"
                    type="year"
                    placeholder="选择年">
            </el-date-picker>
            <el-button @click="chartDialog()">查询</el-button>
            <div id="statistic" style="width:100%;height:600px;"></div>
            <span slot="footer" class="dialog-footer">
				<el-button @click="chartVisiable = false">关闭</el-button>
			</span>
        </el-dialog>

    </div>
</template>
<script>
    import AddOrUpdate from "./add-or-update";
    import styleJs from "../../../utils/style.js";
    import utilsJs from "../../../utils/utils.js";

    export default {
        data() {
        return {
            searchForm: {
                key: ""
            },
            sessionTable : "",//登录账户所在表名
            role : "",//权限
            userId:"",//当前登录人的id
    // 当前表关联
            yuangongOptions : [],
            yuangong : null,
    // 详情表的关联
             goodsOptions : [],
             goods : null,
    //级联表下拉框搜索条件
    //当前表下拉框搜索条件
              goodsShouyinTypesSelectSearch : [],
            form:{
                id : null,
                goodsShouyinUuidNumber : null,
                yuangongId : null,
                goodsShouyinTruePrice : null,
                goodsShouyinTypes : null,
                goodsShouyinContent : null,
                insertTime : null,
                createTime : null,
            },
            dataList: [],
            pageIndex: 1,
            pageSize: 10,
            totalPage: 0,
            dataListLoading: false,
            dataListSelections: [],
            showFlag: true,
            sfshVisiable: false,
            shForm: {},
            chartVisiable: false,
            echartsDate: new Date(),//echarts的时间查询字段
            addOrUpdateFlag:false,
            contents:null,
            layouts: '',

            //导出excel
            json_fields: {
                //级联表字段
                //本表字段
                     '购买流水号': "goodsShouyinUuidNumber",
                     '实付金额': "goodsShouyinTruePrice",
                     '支付类型': "goodsShouyinTypes",
                     '购买时间': "insertTime",
            },

            //模态框start
            goodsId: null,//某条数据的id
            goodsOptions: [],
            goodsShouyinDialog :false,//出入库订单模态框
            goodsShouyinData :[],//数据
            goodsShouyinTypes :"",//收银类型
            goodsShouyinTypesOptions :[],//收银类型list
            isinfo :false,//是否是查看
            //模态框end
            };
        },
        created() {
            this.contents = styleJs.listStyle();
            this.init();
            this.getDataList();
            this.contentStyleChange()
        },
        mounted() {
            //获取当前登录用户的信息
            this.sessionTable = this.$storage.get("sessionTable");
            this.role = this.$storage.get("role");
            this.userId = this.$storage.get("userId");
            //模态框start
            //收银物品
            this.$http({
                url: `goods/page?page=1&limit=100&goodsDelete=1`,
                method: "get"
            }).then(({ data }) => {
                if (data && data.code === 0) {
                    this.goodsOptions = data.data.list;
                }
            });

            // 收银类型
            this.$http({
                url: `dictionary/page?page=1&limit=100&sort=&order=&dicCode=goods_shouyin_types`,
                method: "get"
            }).then(({ data }) => {
                if (data && data.code === 0) {
                    this.goodsShouyinTypesOptions = data.data.list;
                }
            });

            //模态框end

        },
        filters: {
            htmlfilter: function (val) {
                return val.replace(/<[^>]*>/g).replace(/undefined/g,'');
            }
        },
        components: {
            AddOrUpdate,
        },
        computed: {
            //模态框start

            totalMoney: function() {
                var totalMoney = 0;
                for (var item of this.goodsShouyinData) {
                    totalMoney += item.goodsNewMoney * item.goodsShouyinListNumber
                }
                return totalMoney;
            }

            //模态框end
        },
        methods: {
            chartDialog() {
                let _this = this;
                let params = {
                    dateFormat :"%Y", //%Y-%m
                    riqi :_this.echartsDate.getFullYear(),
                    // riqi :_this.echartsDate.getFullYear()+"-"+(_this.echartsDate.getMonth() + 1 < 10 ? '0' + (_this.echartsDate.getMonth() + 1) : _this.echartsDate.getMonth() + 1),
                    thisTable : {//当前表
                        tableName :'goods_shouyin',//当前表表名,
                        sumColum : 'goods_shouyin_number', //求和字段
                        date : 'insert_time',//分组日期字段
                        // string : 'goods_shouyin_name',//分组字符串字段
                        // types : 'goods_shouyin_types',//分组下拉框字段
                    },
                    // joinTable : {//级联表（可以不存在）
                    //     tableName :'yonghu',//级联表表名
                    //     // date : 'insert_time',//分组日期字段
                    //     string : 'yonghu_name',//分组字符串字段
                    //     // types : 'yonghu_types',//分组下拉框字段
                    // }
                }
                _this.chartVisiable = true;
                _this.$nextTick(() => {
                    var statistic = this.$echarts.init(document.getElementById("statistic"), 'macarons');
                    this.$http({
                        url: "barSum",
                        method: "get",
                        params: params
                    }).then(({data}) => {
                        if(data && data.code === 0){

                            //柱状图 求和 已成功使用
                            //start
                            let yAxisName = "数值";//根据查询数据具体改(单列要改,多列不改)
                            let xAxisName = "月份";
                            let series = [];//具体数据值
                            data.data.yAxis.forEach(function (item,index) {
                                let tempMap = {};
                                // tempMap.name= ["数值"];//根据查询数据具体改(单列要改,多列不改)
                                tempMap.name=data.data.legend[index];
                                tempMap.type='bar';
                                tempMap.data=item;
                                series.push(tempMap);

                            })

                            var option = {
                                tooltip: {
                                    trigger: 'axis',
                                    axisPointer: {
                                        type: 'cross',
                                        crossStyle: {
                                            color: '#999'
                                        }
                                    }
                                },
                                toolbox: {
                                    feature: {
                                        // dataView: { show: true, readOnly: false },  // 数据查看
                                        magicType: { show: true, type: ['line', 'bar'] },//切换图形展示方式
                                        // restore: { show: true }, // 刷新
                                        saveAsImage: { show: true }//保存
                                    }
                                },
                                legend: {
                                    data: data.data.legend//标题  可以点击导致某一列数据消失
                                },
                                xAxis: [
                                    {
                                        type: 'category',
                                        name: xAxisName,
                                        data: data.data.xAxis,
                                        axisPointer: {
                                            type: 'shadow'
                                        }
                                    }
                                ],
                                yAxis: [
                                    {
                                        type: 'value',//不能改
                                        name: yAxisName,//y轴单位
                                        axisLabel: {
                                            formatter: '{value}' // 后缀
                                        }
                                    }
                                ],
                                series:series//具体数据
                            };
                            // 使用刚指定的配置项和数据显示图表。
                            statistic.setOption(option,true);
                            //根据窗口的大小变动图表
                            window.onresize = function () {
                                statistic.resize();
                            };
                            //end
                        }else {
                            this.$message({
                                message: "报表未查询到数据",
                                type: "success",
                                duration: 1500,
                                onClose: () => {
                                    this.search();
                                }
                            });
                        }
                    });
                });
                ////饼状图
                //_this.chartVisiable = true;
                // this.$nextTick(()=>{
                //     var statistic = this.$echarts.init(document.getElementById("statistic"),'macarons');
                //     let params = {
                //         tableName: "goods_shouyin",
                //         groupColumn: "goods_shouyin_types",
                //     }
                //     this.$http({
                //         url: "newSelectGroupCount",
                //         method: "get",
                //         params: params
                //     }).then(({data}) => {
                //         if (data && data.code === 0) {
                //             let res = data.data;
                //             let xAxis = [];
                //             let yAxis = [];
                //             let pArray = []
                //             var option = {};
                //             for(let i=0;i<res.length;i++){
                //                 xAxis.push(res[i].name);
                //                 yAxis.push(res[i].value);
                //                 pArray.push({
                //                     value: res[i].value,
                //                     name: res[i].name
                //                 })
                //                 option = {
                //                     title: {
                //                         text: '保险合同类型统计',
                //                         left: 'center'
                //                     },
                //                     tooltip: {
                //                         trigger: 'item',
                //                         formatter: '{b} : {c} ({d}%)'
                //                     },
                //                     series: [
                //                         {
                //                             type: 'pie',
                //                             radius: '55%',
                //                             center: ['50%', '60%'],
                //                             data: pArray,
                //                             emphasis: {
                //                                 itemStyle: {
                //                                     shadowBlur: 10,
                //                                     shadowOffsetX: 0,
                //                                     shadowColor: 'rgba(0, 0, 0, 0.5)'
                //                                 }
                //                             }
                //                         }
                //                     ]
                //                 };
                //             }
                //                 statistic.setOption(option);
                //                 window.onresize = function() {
                //                     statistic.resize();
                //                 };
                //         }
                //     });
                // })
            },
            contentStyleChange() {
                this.contentSearchStyleChange()
                this.contentBtnAdAllStyleChange()
                this.contentSearchBtnStyleChange()
                this.contentTableBtnStyleChange()
                this.contentPageStyleChange()
            },
            contentSearchStyleChange() {
                this.$nextTick(() => {
                    document.querySelectorAll('.form-content .slt .el-input__inner').forEach(el => {
                        let textAlign = 'left'
                        if(this.contents.inputFontPosition == 2)
                            textAlign = 'center'
                            if (this.contents.inputFontPosition == 3) textAlign = 'right'
                                el.style.textAlign = textAlign
                            el.style.height = this.contents.inputHeight
                            el.style.lineHeight = this.contents.inputHeight
                            el.style.color = this.contents.inputFontColor
                            el.style.fontSize = this.contents.inputFontSize
                            el.style.borderWidth = this.contents.inputBorderWidth
                            el.style.borderStyle = this.contents.inputBorderStyle
                            el.style.borderColor = this.contents.inputBorderColor
                            el.style.borderRadius = this.contents.inputBorderRadius
                            el.style.backgroundColor = this.contents.inputBgColor
                    })
                    if (this.contents.inputTitle) {
                        document.querySelectorAll('.form-content .slt .el-form-item__label').forEach(el => {
                            el.style.color = this.contents.inputTitleColor
                            el.style.fontSize = this.contents.inputTitleSize
                            el.style.lineHeight = this.contents.inputHeight
                        })
                    }
                    setTimeout(() => {
                        document.querySelectorAll('.form-content .slt .el-input__prefix').forEach(el => {
                            el.style.color = this.contents.inputIconColor
                            el.style.lineHeight = this.contents.inputHeight
                        })
                        document.querySelectorAll('.form-content .slt .el-input__suffix').forEach(el => {
                            el.style.color = this.contents.inputIconColor
                            el.style.lineHeight = this.contents.inputHeight
                        })
                        document.querySelectorAll('.form-content .slt .el-input__icon').forEach(el => {
                            el.style.lineHeight = this.contents.inputHeight
                        })
                    }, 10 )
                })
            },
            // 搜索按钮
            contentSearchBtnStyleChange() {
                this.$nextTick(() => {
                    document.querySelectorAll('.form-content .slt .el-button--success').forEach(el => {
                        el.style.height = this.contents.searchBtnHeight
                        el.style.color = this.contents.searchBtnFontColor
                        el.style.fontSize = this.contents.searchBtnFontSize
                        el.style.borderWidth = this.contents.searchBtnBorderWidth
                        el.style.borderStyle = this.contents.searchBtnBorderStyle
                        el.style.borderColor = this.contents.searchBtnBorderColor
                        el.style.borderRadius = this.contents.searchBtnBorderRadius
                        el.style.backgroundColor = this.contents.searchBtnBgColor
                    })
                })
            },
            // 新增、批量删除
            contentBtnAdAllStyleChange() {
                this.$nextTick(() => {
                    document.querySelectorAll('.form-content .ad .el-button--success').forEach(el => {
                        el.style.height = this.contents.btnAdAllHeight
                        el.style.color = this.contents.btnAdAllAddFontColor
                        el.style.fontSize = this.contents.btnAdAllFontSize
                        el.style.borderWidth = this.contents.btnAdAllBorderWidth
                        el.style.borderStyle = this.contents.btnAdAllBorderStyle
                        el.style.borderColor = this.contents.btnAdAllBorderColor
                        el.style.borderRadius = this.contents.btnAdAllBorderRadius
                        el.style.backgroundColor = this.contents.btnAdAllAddBgColor
                    })
                    document.querySelectorAll('.form-content .ad .el-button--danger').forEach(el => {
                        el.style.height = this.contents.btnAdAllHeight
                        el.style.color = this.contents.btnAdAllDelFontColor
                        el.style.fontSize = this.contents.btnAdAllFontSize
                        el.style.borderWidth = this.contents.btnAdAllBorderWidth
                        el.style.borderStyle = this.contents.btnAdAllBorderStyle
                        el.style.borderColor = this.contents.btnAdAllBorderColor
                        el.style.borderRadius = this.contents.btnAdAllBorderRadius
                        el.style.backgroundColor = this.contents.btnAdAllDelBgColor
                    })
                    document.querySelectorAll('.form-content .ad .el-button--warning').forEach(el => {
                        el.style.height = this.contents.btnAdAllHeight
                        el.style.color = this.contents.btnAdAllWarnFontColor
                        el.style.fontSize = this.contents.btnAdAllFontSize
                        el.style.borderWidth = this.contents.btnAdAllBorderWidth
                        el.style.borderStyle = this.contents.btnAdAllBorderStyle
                        el.style.borderColor = this.contents.btnAdAllBorderColor
                        el.style.borderRadius = this.contents.btnAdAllBorderRadius
                        el.style.backgroundColor = this.contents.btnAdAllWarnBgColor
                    })
                })
            },
            // 表格
            rowStyle({row, rowIndex}) {
                if (rowIndex % 2 == 1) {
                    if (this.contents.tableStripe) {
                        return {color: this.contents.tableStripeFontColor}
                    }
                } else {
                    return ''
                }
            },
            cellStyle({row, rowIndex}) {
                if (rowIndex % 2 == 1) {
                    if (this.contents.tableStripe) {
                        return {backgroundColor: this.contents.tableStripeBgColor}
                    }
                } else {
                    return ''
                }
            },
            headerRowStyle({row, rowIndex}) {
                return {color: this.contents.tableHeaderFontColor}
            },
            headerCellStyle({row, rowIndex}) {
                return {backgroundColor: this.contents.tableHeaderBgColor}
            },
            // 表格按钮
            contentTableBtnStyleChange() {
                // this.$nextTick(()=>{
                //   setTimeout(()=>{
                //     document.querySelectorAll('.table-content .tables .el-table__body .el-button--success').forEach(el=>{
                //       el.style.height = this.contents.tableBtnHeight
                //       el.style.color = this.contents.tableBtnDetailFontColor
                //       el.style.fontSize = this.contents.tableBtnFontSize
                //       el.style.borderWidth = this.contents.tableBtnBorderWidth
                //       el.style.borderStyle = this.contents.tableBtnBorderStyle
                //       el.style.borderColor = this.contents.tableBtnBorderColor
                //       el.style.borderRadius = this.contents.tableBtnBorderRadius
                //       el.style.backgroundColor = this.contents.tableBtnDetailBgColor
                //     })
                //     document.querySelectorAll('.table-content .tables .el-table__body .el-button--primary').forEach(el=>{
                //       el.style.height = this.contents.tableBtnHeight
                //       el.style.color = this.contents.tableBtnEditFontColor
                //       el.style.fontSize = this.contents.tableBtnFontSize
                //       el.style.borderWidth = this.contents.tableBtnBorderWidth
                //       el.style.borderStyle = this.contents.tableBtnBorderStyle
                //       el.style.borderColor = this.contents.tableBtnBorderColor
                //       el.style.borderRadius = this.contents.tableBtnBorderRadius
                //       el.style.backgroundColor = this.contents.tableBtnEditBgColor
                //     })
                //     document.querySelectorAll('.table-content .tables .el-table__body .el-button--danger').forEach(el=>{
                //       el.style.height = this.contents.tableBtnHeight
                //       el.style.color = this.contents.tableBtnDelFontColor
                //       el.style.fontSize = this.contents.tableBtnFontSize
                //       el.style.borderWidth = this.contents.tableBtnBorderWidth
                //       el.style.borderStyle = this.contents.tableBtnBorderStyle
                //       el.style.borderColor = this.contents.tableBtnBorderColor
                //       el.style.borderRadius = this.contents.tableBtnBorderRadius
                //       el.style.backgroundColor = this.contents.tableBtnDelBgColor
                //     })

                //   }, 50)
                // })
            },
            // 分页
            contentPageStyleChange() {
                let arr = []
                if (this.contents.pageTotal) arr.push('total')
                if (this.contents.pageSizes) arr.push('sizes')
                if (this.contents.pagePrevNext) {
                    arr.push('prev')
                    if (this.contents.pagePager) arr.push('pager')
                    arr.push('next')
                }
                if (this.contents.pageJumper) arr.push('jumper')
                this.layouts = arr.join()
                this.contents.pageEachNum = 10
            },

            init() {
            },
            search() {
                this.pageIndex = 1;
                this.getDataList();
            },
            // 获取数据列表
            getDataList() {
                this.dataListLoading = true;
                let params = {
                    page: this.pageIndex,
                    limit: this.pageSize,
                    sort: 'id',
                }

                 
                if (this.searchForm.goodsShouyinUuidNumber!= '' && this.searchForm.goodsShouyinUuidNumber!= undefined) {
                    params['goodsShouyinUuidNumber'] = '%' + this.searchForm.goodsShouyinUuidNumber + '%'
                }
                         
                if (this.searchForm.goodsShouyinTypes!= '' && this.searchForm.goodsShouyinTypes!= undefined) {
                    params['goodsShouyinTypes'] = this.searchForm.goodsShouyinTypes
                }
                        
                params['goodsShouyinDelete'] = 1// 逻辑删除字段 1 未删除 2 删除


                this.$http({
                    url: "goodsShouyin/page",
                    method: "get",
                    params: params
                }).then(({data}) => {
                    if(data && data.code === 0){
                        this.dataList = data.data.list;
                        this.totalPage = data.data.total;
                    }else{
                        this.dataList = [];
                        this.totalPage = 0;
                    }
                    this.dataListLoading = false;
                });

                //查询级联表搜索条件所有列表
                //查询当前表搜索条件所有列表
                //填充下拉框选项
                this.$http({
                    url: "dictionary/page?dicCode=goods_shouyin_types&page=1&limit=100",
                    method: "get",
                }).then(({data}) => {
                    if(data && data.code === 0){
                        this.goodsShouyinTypesSelectSearch = data.data.list;
                    }
                });
            },
            //每页数
            sizeChangeHandle(val) {
                this.pageSize = val;
                this.pageIndex = 1;
                this.getDataList();
            },
            // 当前页
            currentChangeHandle(val) {
                this.pageIndex = val;
                this.getDataList();
            },
            // 多选
            selectionChangeHandler(val) {
                this.dataListSelections = val;
            },
            // 添加/修改
            addOrUpdateHandler(id, type) {
                this.showFlag = false;
                this.addOrUpdateFlag = true;
                this.crossAddOrUpdateFlag = false;
                if (type != 'info') {
                    type = 'else';
                }
                this.$nextTick(() => {
                    this.$refs.addOrUpdate.init(id, type);
                });
            },
            // 下载
            download(file) {
                window.open(" ${file} ")
            },
            // 删除
            deleteHandler(id) {
                var ids = id ? [Number(id)] : this.dataListSelections.map(item => {
                    return Number(item.id);
                });

                this.$confirm(`确定进行[${id ? "删除" : "批量删除"}]操作?`, "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(() => {
                    this.$http({
                        url: "goodsShouyin/delete",
                        method: "post",
                        data: ids
                    }).then(({data}) => {
                        if(data && data.code === 0){
                            this.$message({
                                message: "操作成功",
                                type: "success",
                                duration: 1500,
                                onClose: () => {
                                    this.search();
                                }
                            });
                        }else{
                            this.$message.error(data.msg);
                        }
                    });
                });
            },
            // 导入功能上传文件成功后调用导入方法
            goodsShouyinUploadSuccess(data){
                let _this = this;
                _this.$http({
                    url: "goodsShouyin/batchInsert?fileName=" + data.file,
                    method: "get"
                }).then(({data}) => {
                    if(data && data.code === 0){
                        _this.$message({
                            message: "导入购买数据成功",
                            type: "success",
                            duration: 1500,
                            onClose: () => {
                                _this.search();
                            }
                        });
                    }else{
                        _this.$message.error(data.msg);
                    }
                });

            },
            // 导入功能上传文件失败后调用导入方法
            goodsShouyinUploadError(data){
                this.$message.error('上传失败');
            },
            //模态框start

            //添加商品
            addGoodsShouyinData(){
                let _this = this
                let tempFlag = false;
                this.goodsShouyinData.forEach(function (item,index) {
                    if(item.id == _this.goodsId){
                        tempFlag = true;
                    }
                });
                if(tempFlag){
                    alert("该数据已经在列表中");
                    return false;
                }
                this.$http({
                    url: `goods/info/`+_this.goodsId,
                    method: "get"
                }).then(({ data }) => {
                    if (data && data.code === 0) {
                        let goods  = {};
                        goods.id = data.data.id;
                        goods.goodsName = data.data.goodsName;
                        goods.goodsNewMoney = data.data.goodsNewMoney;
                        goods.goodsKucunNumber = data.data.goodsKucunNumber;
                        goods.goodsShouyinListNumber = 1;
                        _this.goodsShouyinData.push(goods);
                    }
                });
            },
            //打开模态框 收银操作
            openGoodsShouyinDialog(){
                this.goodsShouyinData=[];
                this.goodsId = null;
                this.isinfo = false;
                this.goodsShouyinTypes="",//收银类型
                this.goodsShouyinDialog= true;
            },
            //打开模态框 查看详情
            getId(id){
                let _this = this;
                _this.$http({
                    url: `goodsShouyin/info/`+id,
                    method: "get"
                }).then(({ data }) => {
                    if (data && data.code == 0) {
                        _this.goodsShouyinTitle = (data.data.goodsShouyinTypes == 1?"出库":"入库");
                        _this.goodsShouyinName = data.data.goodsShouyinName;
                        let params = {
                            page: 1,
                            limit: 1000,
                            sort: 'id',
                            goodsShouyinId: data.data.id,
                        }
                        _this.$http({
                            url: `goodsShouyinList/page`,
                            method: "get",
                            params: params
                        }).then(({ data }) => {
                            if (data && data.code == 0) {
                                _this.goodsShouyinData =data.data.list;
                            } else {
                                _this.$message.error("查询不到列表数据");
                            }
                        });
                    } else {
                        _this.$message.error("查询不到数据");
                    }
                });
                this.isinfo = true;

                _this.goodsShouyinDialog= true;
            },
            //删除数据
            deleteGoodsShouyinData(index){
                this.goodsShouyinData.splice(index,1);
            },
            //提交数据
            submitGoodsShouyinData(){
                let _this = this;
                let params = {};
                if(_this.goodsShouyinTypes ==null || _this.goodsShouyinTypes == "" || _this.goodsShouyinTypes == "null"){
                    alert("收银类型不能为空");
                    return false;
                }
                params["goodsShouyinTypes"] = _this.goodsShouyinTypes;
                let map = {};
                _this.goodsShouyinData.forEach(function (item,index) {
                    map[item.id] =item.goodsShouyinListNumber;
                })
                if(JSON.stringify(map)=='{}'){
                    alert("数据不能为空");
                    return false;
                }
                params["map"] =map;
                _this.$http({
                    url: `goodsShouyin/shouyin`,
                    method: "post",
                    data: params
                }).then(({ data }) => {
                    if (data && data.code === 0) {
                        _this.$message({
                            message: "操作成功",
                            type: "success",
                            duration: 1500,
                            onClose: () => {
                                _this.goodsShouyinDialog= false;
                                _this.search();
                            }
                        });
                    } else {
                        this.$message.error(data.msg);
                    }
                });
            },
            //模态框start
        }
    };
</script>
<style lang="scss" scoped>
.slt {
    margin: 0 !important;
    display: flex;
  }

  .ad {
    margin: 0 !important;
    display: flex;
  }

  .pages {
    & /deep/ el-pagination__sizes{
      & /deep/ el-input__inner {
        height: 22px;
        line-height: 22px;
      }
    }
  }


  .el-button+.el-button {
    margin:0;
  }

  .tables {
	& /deep/ .el-button--success {
		height: 30px;
		color: rgba(0, 0, 0, 1);
		font-size: 10px;
		border-width: 1px;
		border-style: none none solid none;
		border-color: #DCDFE6;
		border-radius: 0px;
		background-color: rgba(255, 255, 255, 1);
	}

	& /deep/ .el-button--primary {
		height: 30px;
		color: rgba(0, 0, 0, 1);
		font-size: 10px;
		border-width: 1px;
		border-style: none none solid none;
		border-color: #DCDFE6;
		border-radius: 0px;
		background-color: rgba(255, 255, 255, 1);
	}

	& /deep/ .el-button--danger {
		height: 30px;
		color: rgba(0, 0, 0, 1);
		font-size: 10px;
		border-width: 1px;
		border-style: none none solid none;
		border-color: #DCDFE6;
		border-radius: 0px;
		background-color: rgba(255, 255, 255, 1);
	}

    & /deep/ .el-button {
      margin: 4px;
    }
  }</style>


